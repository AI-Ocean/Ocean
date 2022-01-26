# Ocean Helmfile

## Install
### 1. set environment variable
```bash
$ vi env.template
MINIO_ACCESS_KEY=test
MINIO_SECRET_KEY=test
...
```

### 2. install helmfiles
```bash
$ helmfile apply
```

### 3. set /etc/hosts in all nodes
<pre>
$ k get service/harbor -n harbor -o jsonpath='{.spec.clusterIP}'
<b>10.104.160.74</b>
</pre>

<pre>
$ ssh <YOUR NODE USER>@<YOUR NODE IP> -p <YOUR NODE PORT>
$ vi /etc/hosts
127.0.0.1 localhost localhost.localdomain
...
<b>10.104.160.74 harbor.harbor.svc</b>
</pre>

## Update
```bash
$ helmfile --environments=oceanUpdate sync
```