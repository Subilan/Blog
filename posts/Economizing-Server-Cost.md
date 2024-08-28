---
date: 2024/08/26
cate: 代码
---

# 自动化的 Minecraft 服务器管理平台

这里所说的一样「自动化 Minecraft 服务器管理平台」即现在已经投入使用的 [TiLab](https://lab.seati.cc)。本文将讲述其具体用途和来历，以及大致的搭建过程。

## 综述

这一项目最初想法的产生，源于 [SomeBottle](https://bottle.moe/) 在前些年提到的一种使用阿里云提供的*抢占式实例*来实现以较低成本运营 Minecraft 服务器的方案。Seati（2023 年以前叫做 Seatide）在 2022 年曾经实现过一段时间这样的模式，并基本验证了这种方案的可行性，同时也成功节省了许多成本。在 Seatide 改为 Seati 后，我希望能够搭建一个可以与游戏紧密联系的「社区」类平台。

在搭建这一论坛之前，首先需要保证服务器的正常运行，遂决定采用一些较新的技术栈重写服务器的管理平台，并将其命名为「TiLab」，其中 Ti 取的是 Seati 这一名称的简写，Lab 则指这一平台更类似于一个包含各种功能的实验室。

整个平台按照简单的前后端分离模式编写，首先开发的是后端的内容，之后开发的是前端。相比于上一次，技术栈发生了比较大的改变。

| |2024 年重写|2022 年实现|
|:-:|:-:|:-:|
|Repo|[seatitanium/lab-backend](https://github.com/seatitanium/lab-backend)|[seatidemc/backend](https://github.com/seatidemc/backend)|
|前端|Nuxt 3 (Vue 3)|Vue 2|
|后端|gin (Go)|Flask 2<br/>Python 3|

本文将聚焦于后端的部分，并部分提及前端的一些设计方面的内容。

## 1. 抢占式实例

抢占式实例是这一想法存在的根基，也是 IaaS 平台中唯一能够达到本文所述的总体目的的产品。

### 简介

阿里云平台上的实例有三种付费方式：

- 包年包月
- 按量计费
- 抢占式实例

前两种在大多数的 IaaS 中都普遍存在，抢占式实例则较为特殊。它可以理解为一种特殊的按量计费。

普通的按量计费模式，是对用量进行一个明确的定价，再按照具体的消费情况对其进行计算、扣费，适合短期使用，与包年包月相比，相当于提供了一种允许使用低于一个月的付费方案。这种模式在长期使用的情况下有可能造成成本高于包年包月的状况。

抢占式实例的定价有别于按量计费，其价格并不稳定，而是按照市场供需关系进行调整。每个用户进行一定的出价，当出价满足定价、库存满足时，便可以继续保有实例。根据测试[^1]，这种保有权检测的周期为一个小时。相比于按量计费，抢占式实例并不能提供一个绝对稳定的运行环境，实例的保有权受外界因素影响。

不过，阿里云提供了一样自动出价的选项。根据测试[^1]，当该选项被选中时，抢占式实例很难被释放——不过扣费的价格会出现一定的波动，这是因为自动出价策略总是按照高于或者等于市场定价出价，从而达到持久保有实例的效果。

但是持久保有实例并非我们最终所需要的。实际上，我们所需要的只是服务器的「按需运行」，即当服务器中没有玩家的时候，考虑一定的延迟，之后进行备份数据、释放服务器的操作，从而达到更进一步的对成本的节省。这一点便是整个抢占式实例的核心。

因此，根据上面这些理论与实践的结合，抢占式实例完全不失为一种巧妙、便捷而又节省成本的运行 Minecraft 服务器的模式。不过很明显的一点是，如果想要让这样一种模式按照某种适合的逻辑运行起来，额外的程序加持是有必要的，这也是编写 Lab 这一平台最主要的一个原因。

上面提到的「按需运行」引出了一样抢占式实例的局限性，大致可以总结为「非绝对永久实例所造成的个体标识问题」。例如，[MCMOD](https://www.mcmod.cn/) 这一平台的「找服玩」板块支持服主提交自己的服务器相关信息以求曝光，其中需要填写的一项是服务器的 IP 地址，用于在该网站上显示服务器当前的状态。这时就出现了 IP 不固定所造成的无法提交的问题。此外还有更多需要长期获取「标识符」的服务器都不能正常使用。

:::tip
其实无论是从外部网站，还是从自身开发的角度上来讲，固定的 IP 地址的确是更好的选择。「别人的平台」与「自己的平台」的区别在于，对「自己的平台」而言，可以选择主动调用动态的 IP 信息，而外部网站会考虑到开发、维护成本而只支持静态的 IP 地址。

考虑到上面这一点，Seati 更加倾向于自身平台的开发，以求更多方面的可用性。
:::

[^1]: 这里的「测试」是指 2022 年 Seatide 采用这种模式开服务器的几个月里，通过阿里云账单提供的费用数据总结而得出的结论。

### 数据持久性的保证

在抢占式实例上运行 Minecraft 服务器，首先需要确保的是数据的持久性。必须选择自动出价而非设定某一上限进行出价，否则实例被释放的概率会大幅增加。但是，由于其不稳定性，即使这样也不能百分之百地确保服务器是稳定持有的，于是我们就需要用到**备份**。备份的实现有两种思路，一种是在本地硬盘中进行备份，只需要用到 crontab；另一种则是借助云端空间，将本地数据向外部传输。

这两种方案对应的是云盘和 OSS 两样产品。

#### 1. 云盘

实例上挂载的硬盘就是云盘，每个实例都至少有一个云盘（系统盘），也可以挂载更多盘（数据盘）。云盘能够实现数据持久保存的根本原因在于它并不需要与实例绑定——可以通过设置「不随实例释放」而在 CPU、RAM 等资源释放以后依然保留下来。

这就相当于将电脑的其它部分返还，将硬盘保留下来，等下一次电脑部件到货后重新安装，直接使用。

这里的优点是显然的：实例释放之时的数据将会原原本本地保留在云盘上而不会发生丢失或者不同步的情况，云盘的存在也不会受到除了人工和账户余额外其它因素的影响。

#### 2. OSS

OSS（或者腾讯云的 COS 等类似概念）是一种外部的独立空间，以 bucket 为单位存储数据。它提供了一种通过内网，从实例向 bucket 中高速传输数据的方式。借助于内网，100GB 以内的数据（也是一般情况下 Minecraft 服务器所能达到的上限）的传输所消耗的时间是可以接受的。

#### 选择 OSS 而不是云盘

最终我们将选择 OSS 作为数据存放的空间，其主要原因在于云盘的一些致命缺点

- 价格相比于 OSS 高
- 在部分实例类型上，云盘的选择有限
- **精确到可用区的限制**

其中精确到可用区的限制是最大的问题，相比于 OSS 仅精确到地域，这大大减少了将来实例类型可选择的范围。OSS 的缺点在于，其传输需要一定的时间，因此无法做到数据的完全同步[^2]，但这种情况只会在遇到抢占式实例被强制释放（而非可控的主动释放）时出现，其概率较小。

### 实例规格的挑选

阿里云的大部分实例，其 CPU 主频并不高（3 GHz 或以下），这本身在服务器 CPU 中是很常见的现象。早先 Seatide 所使用的实例规格为 ecs.g6 系列，其采用 Intel® Xeon® Platinum 8269CY (Cascade Lake)，主频为 2.5 GHz，睿频为 3.2 GHz。但由于 Minecraft 服务器的特殊性，这样的频率远远无法满足多人游玩的场景。

因此在挑选实例规格时，必须考虑到 CPU 的主频，好在阿里云提供了专门的高主频型实例。目前 Seati 采用的是 ecs.hfg8i（基频 3.3，睿频 3.9）、ecs.hfg7（基频 >=3.3，睿频 3.8）两种规格的实例。其中 ecs.hfg8i 库存较少，除了香港外只有 4 个内地地域可以购买，因此具有较高的释放风险。

![ecshfg8i-storage](./Economizing-Server-Cost/image0.png)
*ecs.hfg8i 可购买的地域*

参见：

- [高主频型实例规格_云服务器 ECS(ECS)-阿里云帮助中心](https://help.aliyun.com/zh/ecs/user-guide/instance-families-with-high-clock-speeds)
- [选择实例规格_云服务器 ECS(ECS)-阿里云帮助中心](https://help.aliyun.com/zh/ecs/user-guide/instance-families)
- 自行填写 INSTANCE_TYPE 查看实例可购买可用区：https://ecs-buy.aliyun.com/instanceTypes#/instanceTypeByRegion?instanceType=


## 2. 自动开服流程

借助抢占式实例，一个大体的服务器运行流程框架为：当服务器没有人的时候，应该减少成本的消耗以至于没有成本；只有在有人玩时，才消耗成本维持服务器运行。但这一点并不能完全做到。我们能够做到的是当服务器连续*多久*没有人在线时，备份[^2]，然后释放服务器的所有计算资源，将成本缩减至低价的 OSS 上。下次如果有人想要进入服务器时，开启服务器并恢复先前的备份，达到连续游玩的目的。

[^2]: 在可控的自主释放时进行备份，并在下一次开启服务器的时候恢复备份，可以实现存档的连续游玩而几乎没有任何损失。只有在实例由于一些特殊原因，例如库存紧急不足，或者账户余额不足的时候被阿里云系统强制释放时，服务器的备份才会出现过时的状况，此时需要从原有的定时备份进行恢复。

为了方便，下面将广义的备份划分为两种不同的独立概念：

- **归档**（archive），指用于开服的直接数据。在服务器开启之初、服务器自主释放之时更新，并在每次服务器开启的时候调用。只有在实例因为特殊的原因被删除时，归档才出现过时的情况，否则大部分情况下都应该视归档为最新的服务器存档。
- **备份**（backup），指定期拷贝到 OSS 的服务器数据，用于特殊情况的恢复工作，属于「底牌」。

于是一个正常的服务器运行周期可以描述为

1. **开启与部署阶段**
   1. 玩家自行触发服务器的开启<sup>1</sup>，实例开启并下载安装<sup>2</sup> JRE、screen 等运行所需要的环境和软件
   2. 实例借助 ossutil<sup>3</sup> 从 OSS 上下载 archive<sup>a</sup> 的内容到一个固定的位置<sup>b</sup>
   3. 调用<sup>4</sup>启动脚本（`startserver.sh`），启动服务器
2. **正常运行阶段**
   - 玩家进入服务器游玩，直到服务器内没有玩家
   - 定期备份<sup>5</sup>
3. **停机处理阶段**
   1. 监测服务器的人数<sup>6</sup>，如果服务器连续无人的时间达到某个阈值，执行归档脚本（`archive.sh`）
   2. 等待归档脚本执行完毕后，释放服务器资源<sup>7</sup>

可见以上流程需要多种编程实现的加持才能够达成。标号 2、3、4 的流程可以在本地 shell 脚本中编写相关逻辑，通过阿里云 ECS 中的云助手在服务器开启之时调用<sup>8</sup>。标号 5、6、7 是安装于服务器中的插件所实现的功能，7、8 需要通过阿里云 SDK 调用相关 API 并传入正确的参数实现。

标号 a、b 是两个需要被固定的路径，archive 路径可以是 `oss://bucketname/archive/`，「固定的位置」是一个不应变化的本地位置，用于存储服务器的所有数据，例如 `/data/minecraft/server`。

## 3. 后端实现

后端作为一个 Web 服务，具有在多个应用程序内均可以被轻松请求到的特点。借助阿里云发布的 SDK 以及其开放平台上的代码生成功能，很容易就可以编写出可供调用的 endpoint。TiLab 的后端使用 Go 语言，框架是 gin，本文以此为例进行代码的编写。其它语言可自行类推。

:::tip
RESTful 路由相关的设置，可以直接参考 GitHub 上 TiLab 的相关代码，在此不再赘述：[router.go](https://github.com/seatitanium/lab-backend/blob/main/common/router.go)。
:::

### API Client 的创建

首先安装核心库依赖，然后安装 SDK。如果你使用的不是 Go 语言，可以在[这里](https://api.aliyun.com/api-tools/sdk/Ecs)找到主流语言的依赖安装指令。

```sh
# 此处采用的是 v2
go get github.com/alibabacloud-go/darabonba-openapi/v2/client
go get github.com/alibabacloud-go/ecs-20140526/v4
```

在编写对接阿里云 API 的代码之前，需要在 RAM 账户管理下面创建新的 AK，适当给予权限（为了方便可以直接给予 ECSFullAccess）。阿里云的每一个产品的 API 都具有一个独立的 endpoint，并且各个地域都是相互独立的，例如深圳地域的 ECS endpoint 是 `ecs.cn-shenzhen.aliyuncs.com`，其格式为 `[product_code].[region_id].aliyuncs.com`。

![api-endpoint-format](./Economizing-Server-Cost/image.png)

确定了 AK 和 endpoint 以后就可以调用 SDK 来创建 client 进而调用 API 来完成操作了。

```go
// AliyunConfig 存储有 AK 和地域名
func CreateEcsClient() (*aliyunEcs.Client, error) {
	config := &openapi.Config{
		AccessKeyId:     tea.String(AliyunConfig.AccessKeyId),
		AccessKeySecret: tea.String(AliyunConfig.AccessKeySecret),
		RegionId:        tea.String(AliyunConfig.RegionId),
	}

	config.Endpoint = tea.String("ecs." + AliyunConfig.RegionId + ".aliyuncs.com")

	ecsClient, err := aliyunEcs.NewClient(config)

	if err != nil {
		return nil, err
	}

	return ecsClient, nil
}
```

更广泛地，可以编写 `CreateClient` 函数。

```go
config.Endpoint = tea.String(product + "." + AliyunConfig.RegionId + ".aliyuncs.com")
```

在具备了 client 以后，就可以创建各种 API 调用了。

### API 调用的编写

下面列出了将会用到的 API。

- CreateInstance
- StartInstance
- StopInstance
- RebootInstance
- DescribeInstance
- AllocatePublicIpAddress
- InvokeCommand
- DescribeCloudAssistantStatus

它们的作用可以在下文找到。以 CreateInstance 为例，其具体写法具有一定的模板。首先，创建一个 client

```go
client, err := CreateEcsClient()

if err != nil {
    // ...
}
```

接下来创建一个与 API 同名的 Request。根据 [CreateInstance 的相关文档](https://api.aliyun.com/document/Ecs/2014-05-26/CreateInstance)可以找到 Request 中的各项参数的格式和解释。

```go
import (
	ecs "github.com/alibabacloud-go/ecs-20140526/v4/client"
	"github.com/alibabacloud-go/tea/tea"
)

request := &ecs.CreateInstanceRequest {
    RegionId:                tea.String(conf.PrimaryRegionId), // 必填
    InstanceType:            tea.String(conf.InstanceType), // 必填
    ZoneId:                  tea.String(conf.ZoneId),
    IoOptimized:             tea.String(conf.IoOptimized),
    SpotDuration:            tea.Int32(conf.SpotDuration),
    ImageId:                 tea.String(conf.ImageId),
    SecurityGroupId:         tea.String(conf.SecurityGroupId),
    InstanceName:            tea.String(conf.InstanceName),
    InternetChargeType:      tea.String(conf.InternetChargeType),
    InternetMaxBandwidthOut: tea.Int32(conf.InternetMaxBandwidthOut),
    Password:                tea.String(conf.Password),
    InstanceChargeType:      tea.String(conf.InstanceChargeType),
    SpotStrategy:            tea.String(conf.SpotStrategy),
    DryRun:                  tea.Bool(conf.DryRun),
}
```

以上各项可以按需省略。在这里需要注意的是，传入的各项参数必须使用 `tea` 包中对应类型的包装函数进行处理。对云盘的相关设置（可选）需要单独编写相应的 struct。

![systemdisk-config](./Economizing-Server-Cost/image-1.png)
*文档中 SystemDisk 的相关设置*

```go
// 可选：系统盘和数据盘的相关配置

// 系统盘
request.SystemDisk = &ecs.CreateInstanceRequestSystemDisk{
    DiskName:         tea.String(conf.SystemDisk.DiskName),
    Category:         tea.String(conf.SystemDisk.Category),
    Size:             tea.Int32(conf.SystemDisk.Size),
    PerformanceLevel: tea.String(conf.SystemDisk.PerformanceLevel),
}

// 数据盘（为数组）
// 长度 <= 16
request.DataDisk = []*ecs.CreateInstanceRequestDataDisk{
    {
        DiskName:           tea.String(conf.DataDisk.DiskName),
        Category:           tea.String(conf.DataDisk.Category),
        Size:               tea.Int32(conf.DataDisk.Size),
        PerformanceLevel:   tea.String(conf.SystemDisk.PerformanceLevel),
    },
}
```

当 `request` 配置好以后，就传入 client 的相应方法中，完成调用。

```go
resp, err := client.CreateInstance(request)

if err != nil {
    // ...
}

// 处理 resp
```

与创建 request 时相同，从 resp 中获取相应的值时，需要调用 `tea` 包中的对应类型的去包装函数进行处理。例如，如果我们想要收集返回的数据并创建一个 `CreatedInstance` struct，可以这样写

```go
createdInstance := CreatedInstance{
	TradePrice: tea.Float32Value(resp.Body.TradePrice), // float32
	InstanceId: tea.StringValue(resp.Body.InstanceId), // string
}
```

以上步骤几乎适用于所有的 API，可以查询相关文档后，仿照着编写并收集数据。

参考：
- [云服务器 ECS_API文档-阿里云OpenAPI开发者门户](https://api.aliyun.com/document/Ecs/2014-05-26/overview)
- [aliyun/darabonba](https://github.com/aliyun/darabonba)
- [API速率配额列表](https://quotas.console.aliyun.com/flow-control-products/ecs/quotas)

### 监控器（monitors）的实现

为什么需要监控器？监控器类似于一个自动执行任务的机器人，当它识别到了一些状态以后，会自动执行相应的操作。上文中 API 的相关调用可以被理解为该机器人的「动作」，如果想要完成一些事情，就需要将这些动作联系起来。

在 2 中所提到的部署阶段，就是需要用到 monitor 的阶段。monitor 可直接作为后端的一部分实现，便于直接调用后端已经实现的各项方法，也可以使用独立的语言开发，通过网络调用来进行操作。在本文中将继续使用 Go 来编写。

2 中所谓「玩家触发服务器的开启」，相当于调用 CreateInstance 这一接口，它是后续一切的开端。我们所要编写的 monitor，要将这里的三个过程变为为实际的操作。

```markdown
1. 玩家自行触发服务器的开启<sup>1</sup>，实例开启并下载安装<sup>2</sup> JRE、screen 等运行所需要的环境和软件
2. 实例借助 ossutil<sup>3</sup> 从 OSS 上下载 archive<sup>a</sup> 的内容到一个固定的位置<sup>b</sup>
3. 调用<sup>4</sup>启动脚本（`startserver.sh`），启动服务器
```

*后面两条为脚本所作的操作，monitor 只是负责调用。*

显然，我们要跟踪一个实例的状态，就需要在创建实例时将实例的标志信息记录并且存储下来，例如 instance id。一个寻常的做法是在接收到 CreateInstance 请求的 response 时，将 instance id 记录下来，并将这一记录设定为 active，后续直接查找 active 记录的 instance id 即可。可以参考下面的数据表设计，来更好地理解这一点。

```sql
CREATE TABLE `ecs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `instance_id` varchar(50) NOT NULL, # <-- 该 instance 的标识符
  `trade_price` float NOT NULL,
  `region_id` varchar(20) NOT NULL,
  `instance_type` varchar(20) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1, # <-- 用来表征当前正在跟踪的 instance 记录
  `status` varchar(20) NOT NULL,
  `deploy_status` varchar(20) DEFAULT 'Pending',
  `created_at` bigint(20) NOT NULL,
  `updated_at` bigint(20) NOT NULL,
  `ip` varchar(30) DEFAULT '',
  `zone_id` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
);
```

这样，我们就可以方便地在数据库中查询到当前存在的「活跃」实例以及对应的信息了，以后在实例被释放时将其设定为不活跃即可。除此之外可以编写额外的逻辑来确保数据表中至多有一个 active=1 的记录。接下来开始实现 monitor。

首先编写 monitor 的启动函数，它可以作为独立于后端 gin 服务器的进程运行。利用 Go 语言的 channel 来实现。下面是一个基本的框架，实现 5 秒运行一次的逻辑。

```go
func RunMonitor() {
	c := make(chan os.Signal)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)

	end := make(chan bool)
    
    interval := time.Seconds*5

	// 当接收到中止信号时，将 b 设置为 true
	go func() {
		<-c
		end <- true
	}()

    go func() {
        for {
            // monitor 逻辑

            select {
            case <-end:
                break
            default:
                time.Sleep(interval)
                continue
            }
        }
    }()

    <-end

    log.Printf("\nStopping monitor\n", monitorName)
}
```

在 `for` 循环中编写具体的逻辑，就可以每 5 秒钟执行一次。这一逻辑大致如下

1. 检测是否有 active 记录存在
   - 如果存在则代表用户触发了服务器的启动，一个新的实例被创建了，继续执行下面的逻辑
   - 如果不存在，则跳过，继续检测
2. 检测服务器的状态，这里用到 DescribeInstance
   - 如果为 `Pending`，则代表还在创建中，不进行操作
   - 如果为 `Stopped`，则代表已经创建好没有启动（**注意：** CreateInstance 只负责创建不负责启动），立即调用 StartInstance
   - 如果为 `Starting`，则代表正在启动，不进行操作
   - 如果为 `Running`，则代表已经启动正在运行，此时执行接下来的逻辑
3. 为服务器分配公网 IP 地址，这里用到 AllocatePublicIpAddress（**注意：** 实例不自带公网 IP，需要像这样自行分配）
4. 等待云助手就绪，如果没有就绪就不进行任何操作，这里用到 DescribeCloudAssistantStatus
5. 云助手就绪后，调用 InvokeCommand 执行指令

这里的指令是指在阿里云 ECS 控制台的云助手中所创建好的指令，调用 InvokeCommand 时传入相应的命令 ID 即可。

![ecs-commands](./Economizing-Server-Cost/image-2.png)
*云助手后台的指令*

以上操作应当为一次性操作，所以在数据表中应当保存有相应的一次性操作标识，或者应当识别是否已经 InvokeCommand 来确保不重复执行。

至于这些指令的具体内容，则可以划分为两个部分，一个部分为固定不变的内容（因为云助手指令一经创建不能修改，如果需要修改只能克隆先前的命令，这样会导致命令 ID 发生变化不利于代码编写），另一部分为可能会变化的内容，可作为另外一个独立的脚本来实现。下面列出 Seati 当前使用的命令内容作为参考。

```shell
#!/bin/bash

echo "***" >> ~/.ssh/authorized_keys
echo "***" >> ~/.ssh/authorized_keys
echo Added 2 ssh keys

echo "[Credentials]
language=CH
endpoint=oss-cn-shenzhen-internal.aliyuncs.com
accessKeySecret=***
accessKeyID=***" > ~/.ossutilconfig
echo Added oss credentials

apt update
apt install git -y

echo Installed git

echo Forcefully using HTTP/1.1 to prevent weird error.
git config --global http.version HTTP/1.1

cd ~
git clone https://github.com/seatitanium/server-scripts.git
cd server-scripts
chmod +x *
echo Running server deployment script

./deploy-server.sh
```

以上指令在导入一些密钥、下载了 [server-scripts](https://github.com/seatitanium/server-scripts) 中的脚本以后，调用脚本中的 `deploy-server.sh` 后结束了操作，剩余的操作都在该脚本中，会随着项目文件的更新而发生变化，无需在此处进行修改。

## 4. 脚本的编写

用脚本将任务串联起来，便于未来的调用。上文中的 `deploy-server.sh` 完成的操作可以概括为

- 格式化数据盘并挂载到一个固定的目录
- 安装常用软件
- 下载 archive
- 启动服务器

其具体内容可以在 <https://github.com/seatitanium/server-scripts/blob/main/deploy-server.sh> 查看。

`oss-archive.sh`、`oss-backup.sh` 即对应前文的 `archive.sh` 和 `backup.sh`，用来分别实现归档和备份操作。为了脚本编写的简便，数据盘挂载的位置应当是固定的。这两个脚本用到了阿里云的 ossutil 和 <https://github.com/seatitanium/oss> 项目（相当于是对 ossutil 的一个包装）。

:::tip
在编写脚本的过程中，需要注意的是 non-interactive 环境下各种指令的使用。例如
- 使用 `apt` 安装程序的时候，需要带上 `-y` 来自动确认。
- 使用 `chmod +x` 来设置正确的权限
- 使用 `screen -dm` 来以 detach 的状态启动新的任务

同时，在这样的自动化场景下，应该舍弃部分功能来确保过程运行的稳定性。这也是为什么云助手指令中有下面这一行：

```sh
echo Forcefully using HTTP/1.1 to prevent weird error.
git config --global http.version HTTP/1.1
```

它是经过测试的结果。
:::

## 5. 插件的编写

根据服务器使用的服务端，需要分别编写相应的插件。Seati 是模组服务器，且大多数时候使用的是 Forge，所以就可以使用 Forge MDK 来编写一个新的插件。这些逻辑其实和 Minecraft 本身的关联不大，因此插件中应该很少会用到平台专有的方法（FML 方法、Spigot 方法等），其涉及到的 event 在不同的服务端平台之间也具有共通性，所以代码的迁移难度比较低，当更换到其它平台时也可以在较短时间内通过复制粘贴、微调的方式做适配。

如 2 中所提到的，插件所负责的是这些功能点：

- 统计人数，如果空置则计算阈值，自动停机
- 定期备份

它们可以使用 `ScheduledExecutorService#scheduleAtFixedRate` 来实现异步运行，从而降低其与服务器线程的联系，保持服务器的性能。

在 Forge 平台上，人数可以调用 `MinecraftServer#getPlayerCount` 方法来获取，每秒检测一次并设定阈值和缓冲值，进行比较即可。当空置时间达到阈值后，进行归档。

```java
// 省略类的相关定义

taskFuture = executorService.scheduleAtFixedRate(() -> {
    if (server.getPlayerCount() == 0) {
        this.emptyTime += 1;
    } else {
        this.emptyTime = 0;
    }

    if (this.emptyTime > getMaxEmptyTime()) {
        Main.LOGGER.warn("Empty time reached the limit of {}s. Archiving files.", getMaxEmptyTime());

        doArchive();

        Main.LOGGER.warn("Archive complete. Server will be deleted immediately.");

        deleteThis();

        // 调用相关方法取消当前的任务，避免重复执行。
        shutdown();
        return;
    }

    if (getMaxEmptyTime() - emptyTime <= 30) {
        Main.LOGGER.warn("The server will be archived and closed in {}s", getMaxEmptyTime() - emptyTime);
    }

}, 0, 1, TimeUnit.SECONDS);
```

释放实例（`deleteThis`）即发 Web 请求到后端的相应接口来立即释放当前的实例。归档（`doArchive`）需要调用前文提到的 `oss-archive.sh`。将其路径写进一个配置文件中，然后使用以下方法调用：

```java
public static @Nullable Process runScript(String scriptPath) {
    ProcessBuilder pb = new ProcessBuilder(scriptPath);
    pb.directory(new File("/"));
    try {
        pb.start();
    } catch (Exception e) {
        e.printStackTrace();
    }
}

public static CompletableFuture<Void> runScriptAsync(String scriptPath) {
    Process p = runScript(scriptPath);

    return CompletableFuture.runAsync(() -> {
        if (p == null) {
            return;
        }

        try {
            p.waitFor();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    });
}
```

之所以要用 `CompletableFuture#runAsync` 包围 `p.waitFor()` 是因为借助 `CompletableFuture#get` 可以明确指定超时时间。接着在 task 逻辑中调用

```java
runScriptAsync("/path/to/oss-archive.sh").get(180);
```

来阻塞（非服务器线程）执行。需要注意的是 Forge 的 `saveEverything` 方法不能相对于服务器线程异步执行，否则会出现不可预测的问题。经过综合考虑，在 backup 或者 archive 前将此过程省略即可。

定时备份是上面逻辑的简化版本，只需使用 `ScheduledExecutorService#scheduleAtFixedRate` 新建一个定期执行的任务，以 180s 的 timeout 用同种方法去调用 `oss-backup.sh` 即可。

## 简单谈谈 TiLab 前端方面的设计

TiLab 前端方面，部分借鉴了 Material Design 中的阴影、圆角和配色，尤其是配色，采用 Material Design Palette 这一 Chrome 插件来完成，主色为 Teal（#009688）。

![teal-colors](./Economizing-Server-Cost/image-3.png)
*Material Design Palette 中的 Teal 相关配色*

字体方面，采用 ArrowType 出品的 Recursive（[Google Fonts](https://fonts.google.com/specimen/Recursive)，[官网](https://recursive.design)）。TiLab 的 Logo 和 favicon 中也采用的是这种字体，具体使用的是它的 casual 变体。

![recursive-website](./Economizing-Server-Cost/image-4.png)
*recursive.design 网站*

部分组件的动态效果参考了 macOS 中的相关设计（菜单中的 help indicator 和 window-already-present 动画）。

## 总结

上文较为简略地展示了这样一个平台是如何被构思和构建的，如果你感兴趣，也可以按照这样的模式自行开发，或者直接使用 Seati 目前开源的这套系统，或者为这套系统添加属于你自己的理解。如有任何疑问，欢迎在[本博客的 Issue](https://github.com/Subilan/Blog/issues) 中提出。

Seatide 在 2022 年就已经实现过了这一模式，如今经过重写，除去一些 Bug，TiLab 的工作依旧比预期的要好，可以节省大部分成本。TiLab 在开发的过程中还增添了许多其它功能，例如游戏时间统计、网页端聊天（WebSocket，参见 [Java-WebSocket](https://github.com/TooTallNate/Java-WebSocket)）等，同时通过 BSS（费用）API，将消费数据实时公开给玩家以供参考。在将来亦可以根据需求推出更多的功能。

可见，在开发这类平台的过程中，创造力是最大的局限。