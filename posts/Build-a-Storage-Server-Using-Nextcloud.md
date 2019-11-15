---
desc: 我开始摸鱼了！
---
# 使用 Nextcloud 搭建私人云盘

先前很多次都有想过搭建一个私人的云盘，却又因为感觉没有必要的矛盾心理而放弃了。这一次终于有机会可以接触到这个步骤了！

由于先前了解过这方面的内容，所以我一个想到了一个开源的应用程序——Nextcloud，大概可以理解为 OwnCloud 的升级版。

![](https://i.loli.net/2019/11/15/VE9OkwWLDlxPfQ6.jpg)

最开始我还以为它是一个线上的云盘服务，后来发现它其实是一个能够自己部署的开源程序。大概可以理解为它直接给你提供了一个一站式的云盘服务，包括前端和后端，这样你就不需要再去自己写程序管理了！*其实大概类似于把百度云部署到了自己的服务器上的感觉（错乱）。*

## 准备工作

在开始搭建之前，你需要准备一些东西，大概有这么几种

- 一台完全被你掌握的 VPS
  - 硬盘要够大！否则就失去了意义。
  - **本文中使用 Ubuntu 18.04 进行演示，其它系统操作应该类似。**
- Apache / Nginx、PHP **>=7.2** 和 MySQL 支持
  - 建议全部使用最新版本

在满足了这些必须条件以后，就可以开始着手搭建了。

## 搭建

### 准备工作

首先我们需要 Nextcloud 的软件包，也就是本体。网页在这里 <https://nextcloud.com/install/#instructions-server>。不过其实你并不需要亲自去，在这里我们会跟随着步骤逐步引入。

Nextcloud 安装有两种方式，一种是传统的软件包解压，另一种是使用官方发布的 `php` 文件按步骤一键安装。不过本文所探讨的仅限于前者，对于后者来说，笔者的服务器上并不能成功运行。考虑到国内部分特殊情况，我本人更倾向于前者。

那么现在开始**下载**吧。点击[这里](https://download.nextcloud.com/server/releases/nextcloud-17.0.1.zip)打开 Nextcloud 17.0.1 的官网下载链接。**该版本截至 2019 年 11 月 15 日为最新。**

::: warning
**:warning: Warning**

Not friendly to mainland network.
:::

```bash
# 为什么不用 curl 呢
curl https://download.nextcloud.com/server/releases/nextcloud-17.0.1.zip -o nextcloud-17.0.1.zip
```

下载完毕后解压到要部署网站的位置。需要注意的是解压出来的并不是一大堆文件，而是一个 `nextcloud` 文件夹，里面包含的才是你想要的文件。因此如果你真的想要把它部署到某个目录，别忘了将 `nextcloud` 文件夹里的文件移动出来（`mv nextcloud/* <document-root>`）。

:::tip
**提示 :info:**

下文中使用 `<document-root>` 代替你所部署网页的位置，即所有网页文件的存放点和 Webserver 的根目录。
:::

```bash
# 如果没有可以 sudo apt-get install unzip
unzip nextcloud-17.0.1.zip
```

这样一来准备工作就完成了。这个时候虽然你可以看到目录底下出现了 `index.php`，但是当你访问的时候你会发现事情并没有你想象的那么简单 :thinking:。

### 依赖和数据库

首先需要确保将 Webserver 的根目录设置为你所解压 Nextcloud 并包含其所有文件的地方，这一步应该不需要多提了。

Nextcloud 所部署的环境应保证**越新越好**：

- 操作系统应使用较新的 LTS 发行版；
- PHP 必须满足 >=7.1，但是强烈推荐 **>=7.2**
- MySQL 必须满足 >=5.5，支持 MariaDB

确保上面的刚性条件具备了以后，我们需要给 php 安装拓展。

```bash
# 这些都是必要的拓展。
sudo apt-get install php7.2-gd php7.2-json php7.2-curl php7.2-mbstring php7.2-mysql php7.2-intl php-imagick php7.2-xml php7.2-zip
```

接下来，为了安装能够顺利进行，我们必须给予 Web 服务器目录的权限：

```bash
# 如果是 nginx 那么这里的用户会有所不同。
sudo chown -R www-data:www-data <document-root>
```

接下来设置数据库。为了方面，这里就不一一解释各个配置的含义。仅需将以下内容粘贴到 `/etc/mysql/my.cnf` 中即可。

```conf
[server]
skip-name-resolve
innodb_buffer_pool_size = 128M
innodb_buffer_pool_instances = 1
innodb_flush_log_at_trx_commit = 2
innodb_log_buffer_size = 32M
innodb_max_dirty_pages_pct = 90
query_cache_type = 1
query_cache_limit = 2M
query_cache_min_res_unit = 2k
query_cache_size = 64M
tmp_table_size= 64M
max_heap_table_size= 64M
slow-query-log = 1
slow-query-log-file = /var/log/mysql/slow.log
long_query_time = 1

[client-server]
!includedir /etc/mysql/conf.d/
!includedir /etc/mysql/mariadb.conf.d/

[client]
default-character-set = utf8mb4

[mysqld]
character-set-server = utf8mb4
collation-server = utf8mb4_general_ci
transaction_isolation = READ-COMMITTED
binlog_format = ROW
innodb_large_prefix=on
innodb_file_format=barracuda
innodb_file_per_table=1
```

:::warning
**注意内容分节**

在编辑 `my.cnf` 的时候，预设情况下可能已经出现了 `[mysqld]` 等小结，这个时候就不要直接暴力粘贴，而是选择性的将那些原先没有的配置粘贴到相应的位置，没有的就直接全部复制。
:::

最后记得重启。

```bash
sudo systemctl restart mysql
```

接下来修改 PHP 的 mysql 拓展的配置。通常情况下这个配置文件应该处于 `/etc/php7/conf.d/mysql.ini`，但是也许是因为系统差异，笔者的配置文件处于 `/etc/php/7.2/apache2/conf.d/20-pdo_mysql.ini`。各位可以根据自己的实际情况结合上述内容判断该配置文件的位置。

验证是否为所要更改的配置文件的依据是看开头是否有

```conf
# configuration for PHP MySQL module
extension=pdo_mysql.so
```

接下来将如下内容粘贴

```conf
[mysql]
mysql.allow_local_infile=On
mysql.allow_persistent=On
mysql.cache_size=2000
mysql.max_persistent=-1
mysql.max_links=-1
mysql.default_port=
mysql.default_socket=/var/lib/mysql/mysql.sock  # Debian squeeze: /var/run/mysqld/mysqld.sock
mysql.default_host=
mysql.default_user=
mysql.default_password=
mysql.connect_timeout=60
mysql.trace_mode=Off
```

重启 Webserver，这里用的是 Apache。

```bash
sudo systemctl restart apache2
```

那么数据库的配置工作就已经完成了！接下来我们创建 Nextcloud 所需要的数据库。

```bash
# 进入数据库

mysql -u root -p
```

然后我们先单独创建一个 Nextcloud 专用账号
```sql
CREATE USER 'nextcloud'@'localhost' IDENTIFIED BY '密码';
```

再创建 Nextcloud 所需的数据库

```sql
-- 在这里使用了 utf8mb4 编码以支持 Emoji 表情
CREATE DATABASE nextcloud CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

然后给予我们之前创建的那个账户对此数据库的完全访问：

```sql
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER, CREATE TEMPORARY TABLES ON nextcloud.* TO 'nextcloud'@'localhost' IDENTIFIED BY '密码';
FLUSH privileges;
```

然后就可以退出了。

### 正式安装

没错！这才是正式安装的时刻。实际上只需要一行指令：

```bash
cd <document-root>
sudo -u www-data php occ maintenance:install --database "mysql" --database-name "nextcloud" --database-user "nextcloud" --database-pass "密码" --admin-user "自定义" --admin-pass "自定义"
```

上述指令较容易出错，只要有一个参数有问题均会导致无法安装。其中标有自定义（密码）的地方代表需要你自己配置填写。

如果最后显示

```output
Nextcloud was successfully installed
```

代表安装成功了。这个时候打开你的网站，应该就可以看到正常页面了！

*（未完待续）*
