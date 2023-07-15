---
desc: 不知道原理，在线等解释。
date: 2021/08/06
cate: 记录
---

# 记一次奇怪的 MySQL 错误解决

今天部署一个 PHP 后端的时候，发现在本地（Windows）测试可以连上数据库，而在生产环境（Ubuntu 20.04）上却报 Permission denied 错误，密码都是正确的，看来还是 Ubuntu 的安全弄得好哟😅，随便去 Google 了一下发现如果要用 root 登录必须得加上 `sudo`？太奇妙了，于是一秒想到去创建一个新的用户。

*错误大概是这样的，一个很平凡的 Access denied。*

```log
(HY000/1698): Access denied for user 'root'@'localhost'
```

然后我就去创建新的用户了，具体流程老生常谈了

```sql
CREATE USER 'rootp'@'localhost' IDENTIFIED BY '...'; -- 不是 root 就可以，嘻嘻
GRANT ALL PRIVILEGES ON *.* TO 'rootp'@'localhost';
FLUSH PRIVILEGES;
```

然后就离开了数据库。就在这个时候我突然不知道怎么想的想要重启一下数据库，虽然这种情况下不重启是完全可以的。重启就重启吧，反正不是甚么高危操作，可这一重启可给爷整麻了啊，出现了我从来没有见过的错误，甚至觉得 MariaDB 在逗我。报错信息大概是这样的：

```log {8-9,17}
Aug 06 01:35:42 server systemd[1]: Starting MariaDB 10.1.47 database server...
-- Subject: Unit mariadb.service has begun start-up
-- Defined-By: systemd
-- Support: http://www.ubuntu.com/support
--
-- Unit mariadb.service has begun starting up.
Aug 06 01:35:43 server mysqld[4431]: 2021-08-06  1:35:43 140103940127872 [Note] /usr/sbin/mysqld (mysqld 10.1.47-MariaDB-0ubuntu0.18.04.1) starting as process 4431 ...
Aug 06 01:35:46 server systemd[1]: mariadb.service: Main process exited, code=exited, status=7/NOTRUNNING
Aug 06 01:35:46 server systemd[1]: mariadb.service: Failed with result 'exit-code'.
Aug 06 01:35:46 server systemd[1]: Failed to start MariaDB 10.1.47 database server.
-- Subject: Unit mariadb.service has failed
-- Defined-By: systemd
-- Support: http://www.ubuntu.com/support
--
-- Unit mariadb.service has failed.
--
-- The result is RESULT.
```

看看高亮的行，说的是 SQL 话吗？啥叫作 `Failed with result 'exit-code'`、`The result is RESULT`？笑死，听君一席话，如听一席话！无论怎么去查，得到的结果都不是完全符合，但是它们都有一个共性就是——你要重装你的 MySQL。确实，重装是一个完美的办法，我也很喜欢，干脆利落不用费事费力想办法，可是——我的数据！MySQL 死了，所以 `mysqldump` 也用不了...这是个悖论，我的数据可能取不回来了，那真是够恐怖。但是我忽然又想到，MySQL 一定是通过文件来存储数据的，于是我搜到了下面这段话。

> What you should do is image your drive, copy it to something else, in preparation for your reinstall. I'd recommend copying everything as authentically as you can, even if that takes a while. That feeling you get when you realize you forgot to salvage something important that is now gone forever is not good.
> 
> MySQL generally stores data in the data directory. It may take some work to get your MySQL back into the same configuration as before, so be sure to grab the appropriate my.cnf file.
> 
> It can be really difficult to extract data from a bunch of MySQL data files without the MySQL process actually running. This is why tools like mysqldump exist. If you can get it running, even limping along, that'll be good enough to snapshot it.
> <br><br>
> *来自 <https://stackoverflow.com/questions/20130706/backup-dead-mysql-server>*

这段话告诉我，将来的路会很坎坷...啊这，我只是想要重启个 MySQL，用得着这样对我吗。束手无策的时候，我突然想到，既然要重装，要不把数据都换个位置试试？也就是说把整个 MySQL 用来存放数据的文件夹换到另外一个地方，嗯，换个新的环境，没准就可以了。就是这个奇妙的脑回路拯救了我。

首先，遇到了一个很坑的地方，那就是不确定数据在哪里。网上说的默认在 `/var/lib/mysql`，虽然我也发现那里有很多文件，也是不敢确定。然后又有的说可以在配置文件 `/etc/mysql/mysql.conf.d/mysqld.cnf` 里面看，结果并没有这个文件，也许是因为我是 MariaDB，所以应该在 `/etc/mysql/my.cnf` 里面。确实有这个文件，但是里面并没有 `datadir` 这个参数，真是醉了。到后来我鼓起勇气把 `datadir` 设置成了 `/mysql-db`，开始了迁移之路。

```shell
mkdir /mysql-db
rsync -av /var/lib/mysql/ /mysql-db
chmod 755 /mysql-db
```

盘点一下这里的坑，首先 `rsync` 的第二个参数 `/var/lib/mysql/` 的最后带不带 `/` 是有区别的。带上了就代表 `/var/lib/mysql/*`，不带上就代表这个目录本身。刚开始没有带，复制了以后也没有去 `ls /mysql-db` 导致启动的时候刷了一大堆 not found 报错...然后就是权限问题，应该是 `755`。

:::tip
为啥不用 `mv *`？因为当时想不到 `mv`，别骂了
:::

然后还有一个点就是要去 apparmor 里面创建一个别名。

```shell
vim /etc/apparmor.d/tunables/alias
```

添加 `alias /var/lib/mysql -> /mysql-db`，然后 `systemctl restart apparmor`。接下来就可以准备启动 MySQL 了。

```shell
systemctl start mysql
```

让我震惊的是这次启动没有报错了。原理还待解释，不过我一秒就去全量备份了一下，因为有了备份就可以直接重装就没有这么多破事了😅

```shell
mysqldump -u root --all-databases > /alldb.sql
```

然后还可以在 cron 里面加一个定时的备份，为了避免输入密码，可以创建一个 `~/my.cnf` 然后写入内容

```ini
[mysqldump]
user=root
password=...
```

然后在 `crontab -e` 里面加入

```
10 * * * * mysqldump -u root --all-databases > /alldb.sql
```

就可以了。