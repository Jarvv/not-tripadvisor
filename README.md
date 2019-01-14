# SETUP

```
npm install
```

# RUN Normal

```
node ./bin/www
```

This will run the server as normal on localhost:3000

# RUN Watch

```
gulp watch
```

This will run the server on localhost:5000, restarting the server whenever there is a change to a file, and will automatically sync your browser. (You can still access it on 3000, but 5000 is where the sync happens)

# Run Chrome with cert flags

## Ubuntu

```
google-chrome --user-data-dir=/tmp/foo --ignore-certificate-errors --unsafely-treat-insecure-origin-as-secure=https://localhost:3000
```

##Mac

```
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --user-data-dir=/tmp/foo --ignore-certificate-errors --unsafely-treat-insecure-origin-as-secure=https://localhost:3000
```

## Windows

```
C:\Program Files (x86)\Google\Chrome\Application\chrome.exe --ignore-certificate-errors --unsafely-treat-insecure-origin-as-secure=https://localhost:3000
```
