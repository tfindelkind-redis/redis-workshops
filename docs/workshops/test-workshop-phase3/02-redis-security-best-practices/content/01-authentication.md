# Authentication

<!-- NAV:START -->
<!-- This navigation is auto-generated. Do not edit manually. -->
## 🧭 Navigation

<table>
<tr>
<td width="33%" align="left">

### [◀️ Module Home](../README.md)
**Redis Security Best Practices**

</td>
<td width="34%" align="center">

### [📚 Redis Security Best Practices](../README.md)
**Section 1 of 3**

</td>
<td width="33%" align="right">

### [Next ▶️](02-network-security.md)
**Network Security**

</td>
</tr>
</table>

---

### 📖 Sections in this Module

1. **Authentication** ← *You are here*
2. [Network Security](02-network-security.md)
3. [Best Practices](03-best-practices.md)

---
<!-- NAV:END -->


## Why Authentication Matters

Redis, by default, has no authentication. This is acceptable for trusted environments but dangerous in production.

## Authentication Methods

### 1. Password Authentication

Set a password in `redis.conf`:

```conf
requirepass your_strong_password_here
```

Connect with password:

```bash
redis-cli -a your_strong_password_here
# or
redis-cli
AUTH your_strong_password_here
```

### 2. ACL (Access Control Lists)

Redis 6.0+ supports fine-grained access control:

```bash
# Create user with specific permissions
ACL SETUSER alice on >password ~keys:* +@all

# List all users
ACL LIST

# Check current user
ACL WHOAMI
```

### 3. TLS/SSL Authentication

Enable TLS for encrypted connections:

```conf
tls-port 6380
tls-cert-file /path/to/cert.pem
tls-key-file /path/to/key.pem
tls-ca-cert-file /path/to/ca.pem
```

## Best Practices

1. **Always use strong passwords** (32+ characters)
2. **Enable ACLs** for fine-grained control
3. **Rotate passwords** regularly
4. **Use environment variables** for secrets
5. **Never commit passwords** to version control

## Exercise

1. Enable password authentication
2. Create ACL users with different permissions
3. Test authentication
4. Document your ACL strategy

## Common Pitfalls

- Using weak or default passwords
- Not enabling authentication in production
- Sharing passwords across environments
- Storing passwords in plain text
