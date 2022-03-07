# PROXY CONFIG

These may be required depending on the server configuration.

In restricted environments docker might need proxy configurations, instead of setting env variables for each image we can create a config file in ```"~/.docker/config.yml"```, with the following lines:

{
 "proxies":
 {
   "default":
   {
     "httpProxy": "$http_proxy",
     "httpsProxy": "$https_proxy",
     "noProxy": "$no_proxy"
   }
 }
}

PLEASE NOTE THAT YOU HAVE TO SET set the above values manually, to find out the values :

echo $http_proxy
echo $https_proxy
echo $no_proxy 

Set them accordingly:
{
 "proxies":
 {
   "default":
   {
     "httpProxy": "http://127.0.0.1:3001",
     "httpsProxy": "http://127.0.0.1:3001",
     "noProxy": "*.test.example.com,.example2.com"
   }
 }
}

More info: https://docs.docker.com/network/proxy/

Once this has been done, save the file in  ```"~/.docker/config.yml"``` 



# DNS CONFIGURAtION 

This is required in case we get different issues when trying to download python packages or files inside our docker containers.

Add the extra dns addresses from your server to ```"/etc/docker/daemon.json"```.

```
{
  "dns": ["8.8.8.8", "8.8.4.4", "someaddress1", "someaddress2"],
}
```
An example ```daemon.json``` file has been provided.

To find out your nameserver:

```
  sudo cat /etc/resolv.conf
```

Copy the IP-addresses from the lines starting with ```nameserver``` to the above json file.

Docker daemon config reference: https://docs.docker.com/engine/reference/commandline/dockerd/#daemon-configuration-file

# REQUIRED STEP for all of the above:

Rrestart the docker service after the configs have been made : ```sudo service docker restart```

