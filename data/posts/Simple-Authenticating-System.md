---
date: 2021/05/20
desc: 抛弃近乎迷惑的 session。
cate: 代码
---

# 用 PHP 实现简单的登录系统

## 目录

登录系统的实现原理一直是一个我好奇的点。最近一直在想 PHP 内登录系统到底该怎样简洁地实现。在这里，*简洁*是指能够满足最基本的用户识别需求，而没有其它更多方面的需求。概括来说，我们所要实现的只是登录以后储存状态，根据该状态判定访问权限。

## 基本思路

这样一个简单的登录系统的思路，大致如下

1. **前端收集登录信息。** 包含最基本的两项：用户名和密码。
2. **后端验证信息并发放 _Token_。** 在这里，验证信息主要是对数据库中对应用户名的密码进行比对，可能的结果有*不存在*、*不匹配*和*匹配*三种。本文中比对所使用的方式是 `password_verify` 函数。
3. **前端存储 _Token_ 并用于执行各项操作。** 后端所需要权限的操作可以将 Token 作为参数，需要 Token 才能工作。前端存储 Token 的办法，可以用 `localStorage`。当然，使用 Cookie 也不是不可以。本文演示前者，实现方式类似。
4. **针对不同状况拟定 _Token_ renew & expire 策略。** Token 一定要有有效期，自然而然也有 renew 和 expire 等问题。

上面四条，我们接下来逐一解释和实践。

## 实践

### 1. Token 设计

Token 到底应该长什么样？实际上应该先讨论我们该怎样传递 Token。为了安全性，我们必定要设计一些加密（encrypt）方法。为了信息可处理，我们也需要思考怎样进行解密（decrypt）。在这个地方我们当然不能用简简单单的 base64 混合其它花里胡哨方法的肤浅加密，而要使用 OpenSSL 的相关方法。

首先，OpenSSL 的加密函数为 `openssl_encrypt`，利用这个函数我们可以封装出一个简单的实际 encrypt。

```php
function encrypt($message, $key) {
    $nonceSize = openssl_cipher_iv_length('aes-256-ctr');
    $nonce = openssl_random_pseudo_bytes($nonceSize);

    $ciphertext = openssl_encrypt(
        $message,
       'aes-256-ctr',
        $key,
        OPENSSL_RAW_DATA,
        $nonce
    );

    return $nonce . $ciphertext;
}
```

其中，**aes-256-ctr** 为加密方式，具体可以自行查询了解，这是比较推荐使用的一种方式。上面的函数具体内容就不多解释。利用上面的函数，只需要一个 key 即可对指定信息进行加密，这些信息便是我们的 Token。

针对上面的 encrypt 函数，我们也有一个对应的 decrypt 函数。

```php
function decrypt($message, $key)
    {
        $nonceSize = openssl_cipher_iv_length('aes-256-ctr');
        $nonce = mb_substr($message, 0, $nonceSize, '8bit');
        $ciphertext = mb_substr($message, $nonceSize, null, '8bit');

        $plaintext = openssl_decrypt(
            $ciphertext,
            'aes-256-ctr',
            $key,
            OPENSSL_RAW_DATA,
            $nonce
        );

        return $plaintext;
    }
}
```

其中 key 是用于加密的密码，应该妥善保管。这两函数便负责了加密和解密。接下来 Token 内容的组织便很容易了。我们可以使用最简单的，那就是 JSON。例如

```php
$token = json_encode([
    "expires" => strtotime("+1 week"),
    "creates" => time()
]);
```

对这个 Token，我们进行 encrypt，然后返回到前端，基本上就没有什么问题了。这个 Token 在前端将长久存在，因而其必须指定一个合理的 expires 以便后端判断其有效性。同时为了避免冒充，我们还可以在 Token 内加入一些特异性内容，例如字符串签名。

### 2. Token 存储

按照设计，Token 被返回到前端以后会被存储起来，目的是作为敏感操作（涉及权限的操作）的凭证。例如若要 POST 涉及权限的操作，则必须带上 Token，否则返回 400。

上文已经提到，我们将会使用 localStorage 或者 Cookie。例如

```javascript
// 假设 r 为后端返回的 Token（已加密字符串）
localStorage.setItem('xxx-login-token', r);
```

至此它就被存了起来。至于 localStorage 保存数据的持续性，可以参考 StackOverflow [How Persistent is localStorage?](https://stackoverflow.com/questions/9948284/how-persistent-is-localstorage)。

对于 Chrome，localStorage 持续性的叙述为

> On disk until deleted by user (delete cache) or by the app.

所以 Token 将会在 localStorage 中长期存在。

在这里出现了一个问题：localStorage 在定义上是属于用户的东西，用户可以完全管理其内容，可以添加、读取和修改其内容，这会对 Token 的安全性造成什么影响？

:::note
**来自 2025 的补充，这种做法与 JWT 的不同点**

对于更常用的 JWT 来说，其验证令牌是否有效的一个关键因素是签名是否匹配，而不是像这里的对内容的加密。JWT 中的 Payload 是公开可见的，因此在里面不能也不应该存储敏感数据。相比于这种方法，JWT 中的私有内容只是 key，其 method 则是公开的。
:::

实际上基本没有。因为 Token 只能由后端生成，而用户把 Token 修改了相当于自己放弃了这个 Token，被修改后的 Token 也无法通过验证（decrypt）。唯一需要防备的，就是不要泄漏 Token 的加密方式。如果加密方式泄漏，那么用户就可以利用各种方法采取完全相同的加密方式加密出完全符合服务端解密函数需求的 Token。在这里，加密方式包含的不仅仅是 method 本身，还有 key。

### 3. Token 利用

Token 的利用主要体现在请求上，且有多种。在这里我们演示最为简单的一种：每一次 POST 敏感操作接口，附带上 Token 作为参数，后端在接到请求后，第一步是验证 Token，通过后继续操作。

比如，每次 route 跳转到敏感页面，我们就可以执行这样一个函数：

```javascript
function checkAuth() {
	let token = localStorage.getItem('xxx-login-token');
	return new Promise((r, j) => {
		if (!token) {
			j();
		} else {
			post(
				'/CheckAuth.php',
				{
					token
				},
				response => {
					if (response === true) {
						r();
					} else {
						j();
					}
				}
			);
		}
	});
}
```

这个函数会获取 localStorage 中的 Token 并发送给后端相应的接口，通过验证，返回一个结果值，前端再根据这个结果值决定是否跳转到指定的页面。

至于 Token 怎样验证：

```php
function checkToken(string $token)
{
    $key = '...'; // 提供加密时的 key 以解密
    try {
        $content = json_decode(decrypt($token, $key, true), true);
        if ($content["expires"] > time()) {
            return true;
        } else {
            return false;
        }
    } catch (Exception $e) {
        return false;
    }
}
```

具体应用中还可以添加更多验证方式在里面。验证成功，就会返回一个 `true`。如果过期，那么就会直接返回 `false`。如果是无效的 Token，根据上面的 encrypt 和 decrypt 函数，会产生一个 Exception。如果产生这个 Exception，就代表通过验证的一个或多个必要条件不满足，自然就能判定这个 Token 无效。

### Token renew & expire 策略

如果 Token 过期了，我们将把它当作无效 Token 同等处理，即 `checkToken(x)` 函数永远返回 false。

至于 Token 的更新以及销毁，前者会发生在登录时。由于 Token 已经被（近乎）永远存在了前端，所以过期的 Token 并没有必要直接删除。每次登录的时候，如果 Token 没有过期，那么直接跳转到相关页面，如果 Token 过期了，那么就返回一个新的 Token。执行 localStorage 的 setItem 语句直接覆盖旧 Token 即可。对于销毁，是用户专门在 Token 有效的时候执行了相关的操作，这个时候就不需要和后端沟通，而前端直接删去 localStorage 中 Token 对应的数据即可，由于前面路由逻辑的存在，页面刷新以后一切就跟没有登录一样了。

### 更安全的 encrypt 和 decrypt

更安全的 encrypt 是将原先不安全函数的加密结果的开头加上一个计算出的 MAC 值。

```php
function encrypt($message, $key)
{
    list($encKey, $authKey) = splitKeys($key);
    $ciphertext = unsafe_encrypt($message, $encKey);

    // 计算
    $mac = hash_hmac('sha256', $ciphertext, $authKey, true);

    // 把 MAC 放在开头
    return $mac . $ciphertext;
}
```

更安全的解密也是基于 MAC 的。在这里我们先验证 MAC，然后再使用先前的解密函数即可。

```php
    public static function decrypt($message, $key)
    {
        list($encKey, $authKey) = splitKeys($key);

        // 避免加密算法变换
        $hs = mb_strlen(hash('sha256', '', true), '8bit');
        $mac = mb_substr($message, 0, $hs, '8bit');

        $ciphertext = mb_substr($message, $hs, null, '8bit');

        $calculated = hash_hmac(
            'sha256',
            $ciphertext,
            $authKey,
            true
        );

        if (!hashEquals($mac, $calculated)) {
            throw new Exception();
        }

        $plaintext = unsafe_decrypt($ciphertext, $encKey);

        return $plaintext;
    }
```

以上操作依赖了两个额外的函数。一个是用来把一个 key 分割成一个用来加密一个用来验证的两个 key。

```php
function splitKeys($masterKey)
    {
        return [
            hash_hmac('sha256', 'ENCRYPTION', $masterKey, true),
            hash_hmac('sha256', 'AUTHENTICATION', $masterKey, true)
        ];
    }
```

另一个是用来验证 hash 是否全等。

```php
function hashEquals($a, $b)
    {
        if (function_exists('hash_equals')) {
            return hash_equals($a, $b);
        }
        $nonce = openssl_random_pseudo_bytes(32);
        return hash_hmac('sha256', $a, $nonce) === hash_hmac('sha256', $b, $nonce);
    }
}
```

## 总结

这是一个相对来说特别简单的登录或者说是验证系统。主要的代码都写在了加密和解密上。对于这样一个系统，是肯定存在漏洞的，因而不能用来当作一个特别重要系统的主要验证方式。但是通过完善，还是可以看到这个系统的有效性的。这个系统在浏览器无痕模式下是无法记录 Token 的，这点和正常的登录也类似。
