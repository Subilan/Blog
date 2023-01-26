---
date: 2023/01/26
cate: 代码
desc: C！R！U！D！CRUD！
---

# 常用 CRUD 前后端架构

在写一些自用的小程序（not wechat mini-programs）或者搭建一个简易的前后台关系时，通常都要进行以下几点的设计

- 前后端请求—返回数据的约定
- 数据库的调用
- 登录认证
- 分页

显然这些设计可以被模式化和模板化，从而提高创建它们的效率。

而不将它们完全作为模板，是因为在这之间还存在着相当大的需求变量；代码层面上，在此基础上可以进行其它扩充。例如对于即使更新的需求，可以加入 websocket 等模块（~~虽然大多数情况下为了省事，我选择 CRUD 轮询~~）；以及为了安全性可以进行更多修改和优化，等等。

下面以 TypeScript 和 Python 举例，其它语言同理。

## 请求—返回数据的约定

首先，我们在后端使用统一的函数进行返回。例如

```python
def response(status, data, msg):
    return {
        'data': data,
        'status': status,
        'msg': msg
    }

data = { ... }
message = 'An error occurred.'

response(status='ok', data=data)
response(status='error', msg=message)
```

利用 [axios](https://axios-http.com/)，可以方便地处理返回数据的类型。

```typescript
// axios 默认返回中，data 才是后端来的数据。
axios.interceptors.response.use(
    response => {
        return response.data
    },
    err => Promise.reject(err)
)

// ...

interface ReponseType = {
    data: any, // 可调整
    status: string,
    msg: string
}

export function post(url: string, data: any) {
    return axios.post<any, ReponseType>(url, data, {
        headers: {
            // 可用于添加 Authorization
        }
    })
}
```

`ResponseType` 即为返回值的骨架类型，可以放在 `axios.post` 和 `axios.get` 两个函数的第二个泛型参数上指定返回值（即在 interceptor 里拦截到的 `response.data`）的类型。

这样在请求时大致就是如下的情形了：

```typescript
post('/abc', {
    abc: 'def'
}).then(r => {
    if (r.status === 'ok') {
        // ...
    }
})
```

## 数据库的调用

数据的调用，在 Python 里通常使用 `pymysql` 库。

```python
from pymysql import connect, cursors

def connect():
    return connect(host='localhost', user='abc', password='def', database='target_db', cursorclass=cursors.DictCursor)
```

注意到 `cursorclass` 在这里是一个很重要的参数。在 PHP 的 `mysqli` 中，通常是通过指定 `mysqli::fetch_all` 的第一个参数 `int $mode` 来实现的。这里的 `cursors.DictCursor` 对应 `MYSQLI_ASSOC`。 

```php
$mysqli = new mysqli('localhost', 'abc', 'def', 'target_db')

$result = $mysqli->query("SELECT ...")

$rows = $result->fetch_all(MYSQLI_ASSOC)
```

然后对于内容的取得就是如同上面 php 代码里所示的司空见惯的逻辑。

```python
with connect() as conn:
    with conn.cursor() as cur:
        cur.execute(conn.escape_string('SELECT ...'))
        return cur.fetchall()
    # 或者
    conn.commit()
```

## 登录认证

登录认证的设计流程已经在[这里](./Simple-Authenticating-System.md)有概述。本文所展示的是使用 `jwt` 库所实现的 Python 版本。

```python
from jwt import encode, decode, DecodeError

def getToken(argument1, argument2):
    payload = {
        'iat': datetime.now(),
        'exp': datetime.now() + timedelta(days=5.0), # 可调整
        'argument1': argument1,
        'argument2': argument2
    }
    return encode(payload, 'secret', 'HS256')

def verifyToken(jwt):
    if jwt == None:
        return False
    try:
        decoded = decode(jwt, 'secret', ['HS256'])
    except DecodeError as e:
        return False
    if decoded['exp'] > int(datetime.now().timestamp()):
        return True
    return False

def decodeToken(jwt):
    if not verify(jwt):
        return None
    assert jwt != None # verify 函数确保 jwt 不是 None
    return decode(jwt, 'secret', ['HS256'])
```

然后在前端以一种安全的方式提交给后端即可，例如使用 Authorization Header。

```typescript
export function post(/* ...*/token: string) {
    axios.post(/* ... */, {
        headers: {
            Authorization: `JWT ${token}`
        }
    })
}
```

后端在验证时，可以使用函数包装，将目标函数添加相应的检测流程。

```python
from functools import wraps
from flask import request

def protected(func):
    @wraps(func) # 必须
    def decorated():
        auth = request.headers.get("Authorization")
        if auth == None:
            return response(status='invalid')
        token = auth.split("JWT ")
        if len(token != 2):
            return response(status='invalid')
        tokenStr = token[1]
        if verifyToken(tokenStr):
            return func()
        else:
            return response(status='invalid')
    return decorated

@app.route(...)
@protected
def api():
    # ...
    return # ...
```

## 分页

要完成分页，首先需要给数据增添数字标识，从而使得数据有序且顺序可比。这一点通常通过一个名为 id 的 key column 实现。

```sql
CREATE TABLE `example` (
    `id` INT UNSIGNED KEY NOT NULL AUTO_INCREMENT
)
```

分页时，需要考虑到

- 每页数据的数目 — 对应 SQL 中的 `LIMIT`
- 数据的排列顺序 — 对应 SQL 中的 `ORDER BY`

且前端分页通常需要后端对下一页数据的预测数据的辅助。

例如我们简单地选取表中最开始的 10 个升序排列的行。

```sql
SELECT * FROM table WHERE id >= 1 ORDER BY id ASC LIMIT 10;
# 或者
SELECT * FROM table WHERE id > 0 ORDER BY id ASC LIMIT 10;
```

这可以作为第一页的内容。此时符合条件的行应当是 `id` 从 1 到 10 的所有行（没有 `id` 缺省的情况下）。接下来选择第二页的内容，即为

```sql
SELECT * FROM table WHERE id >= 11 ORDER BY id ASC LIMIT 10;
# 或者
SELECT * FROM table WHERE id > 10 ORDER BY id ASC LIMIT 10;
```

然而在这里，大于号后面所跟的内容并不一定是 `10` 或者 `11`，因为可能中途有 `id` 的缺省。所以，这时候需要前端指定当前页面的最后一个数据的 `id` 提交给后端。我们将其称为 `indicatorId`。

于是更加准确的 SQL 应当写作

```sql
SELECT * FROM table WHERE id > indicatorId ORDER BY id ASC LIMIT 10;
```

Python 语句示例：

```python
indicatorId = request.args.get('indicator', 0)
pageSize = request.args.get('pageSize', 10)
sql = "SELECT * FROM table WHERE id > {0} ORDER BY id ASC LIMIT {1}".format(indicatorId, pageSize)
```

注意这里应当使用 `>` 而不是 `>=`。若要使用后者，则需要多一个 `+1` 的步骤。

同时，后端需要返回前端一个「是否有下一页」的信息，可让前端判断是否需要展示「下一页」的按钮。这一点在下滑加载（即滑到数据底部后，在底部添加上新的数据）的场景中比较适用。

判断是否有下一页，在升序中，只需要判断 `indicatorId` 是否就是表最后一行数据的 `id`；在降序中，只需要判断 `indicatorId` 是否就是表第一行数据的 `id`。

```python
hasNext = indicator != lastRowId if order == 'asc' else indicator != firstRowId
```

如果要采用不同页加载（即每一页展示固定数量的数据，以页码标记页面）的场景，则可以返回一个总的页码数据。

```python
rowAmount = count('table') # count 函数返回一个表的（指定条件的）总行数
pageAmount = math.ceil(rowAmount / pageSize)
hasNext = currentPage < pageAmount
```
