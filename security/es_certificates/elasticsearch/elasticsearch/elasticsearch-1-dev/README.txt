There are four files in this directory:

1. This README file
2. http-elasticsearch-1-dev.csr
3. http-elasticsearch-1-dev.key
4. sample-elasticsearch.yml

## http-elasticsearch-1-dev.csr

The "http-elasticsearch-1-dev.csr" file is a Certificate Signing Request.
You should provide a copy this file to a Certificate Authority ("CA"), and they will provide you with a signed Certificate.

In many large organisations there is a central security team that operates an internal Certificate Authority that can generate your
certificate for you. Alternatively, it may be possible to have a your certificate generated by a commercial Certificate Authority.

In either case, you need to provide the http-elasticsearch-1-dev.csr file to the certificate authority, and they will provide you with your signed certificate.
For the purposes of this document, we assume that when they send you your certificate, you will save it as a file named "http-elasticsearch-1-dev.crt".

The certificate authority might also provide you with a copy of their signing certificate. If they do, you should keep a copy of that
certificate, as you may need it when configuring clients such as Kibana.

## http-elasticsearch-1-dev.key

The "http-elasticsearch-1-dev.key" file is your private key.
You should keep this file secure, and should not provide it to anyone else (not even the CA).

Once you have a copy of your certificate (from the CA), you will configure your Elasticsearch nodes to use the certificate
and this private key.
You will need to copy both of those files to your elasticsearch configuration directory.

Your private key is protected by a passphrase.
Your password has not been stored anywhere - it is your responsibility to keep it safe.

When you configure elasticsearch to enable SSL (but not before then), you will need to provide the key's password as a secure
configuration setting in Elasticsearch so that it can decrypt your private key.

The command for this is:

   elasticsearch-keystore add "xpack.security.http.ssl.secure_key_passphrase"


## sample-elasticsearch.yml

This is a sample configuration for Elasticsearch to enable SSL on the http interface.
You can use this sample to update the "elasticsearch.yml" configuration file in your config directory.
The location of this directory can vary depending on how you installed Elasticsearch, but based on your system it appears that your config
directory is /usr/share/elasticsearch/config

You will not be able to configure Elasticsearch until the Certificate Authority processes your CSR and provides you with a copy of your
certificate. When you have a copy of the certificate you should copy it and the private key ("http-elasticsearch-1-dev.key") to the config directory.
The sample config assumes that the certificate is named "http-elasticsearch-1-dev.crt".
