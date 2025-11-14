# Network Security

## Network Security Layers

Secure your Redis deployment at multiple levels to create defense in depth.

## 1. Bind to Specific Interfaces

Don't expose Redis to the internet:

```conf
bind 127.0.0.1 ::1
# Or specific private IPs
bind 10.0.1.5
```

## 2. Use Firewalls

Configure firewall rules to restrict access:

```bash
# Allow only specific IPs
sudo ufw allow from 10.0.1.0/24 to any port 6379
sudo ufw deny 6379
```

## 3. VPN or Private Networks

- Deploy Redis in private subnets
- Use VPN for remote access
- Never expose Redis directly to internet

## 4. TLS/SSL Encryption

Encrypt data in transit:

```conf
tls-port 6380
port 0  # Disable non-TLS
tls-cert-file /path/to/cert.pem
tls-key-file /path/to/key.pem
tls-ca-cert-file /path/to/ca.pem
tls-protocols "TLSv1.2 TLSv1.3"
```

## 5. Protected Mode

Redis automatically enables protected mode:

```conf
protected-mode yes
```

This prevents external access unless:
- Authentication is configured
- Bind is explicitly set

## Network Isolation Best Practices

1. **Never bind to 0.0.0.0** in production
2. **Use firewall rules** at OS level
3. **Deploy in private networks** (VPC)
4. **Enable TLS** for all connections
5. **Use connection limits** to prevent abuse

## Exercise

1. Configure bind address
2. Set up firewall rules
3. Enable TLS encryption
4. Test secure connectivity
5. Verify protected mode

## Security Checklist

- [ ] Redis not exposed to internet
- [ ] Firewall rules configured
- [ ] TLS enabled
- [ ] Protected mode enabled
- [ ] Network monitoring in place
