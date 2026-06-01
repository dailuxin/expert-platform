ssh-keyscan -t rsa,ecdsa,ed25519 -p 22 github.com | Out-File -FilePath C:\Users\dailu\.ssh\known_hosts -Encoding utf8 -Append
