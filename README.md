# Not Another Generic Discord Bot!  
A Discord Bot written in Discord.js and Typescript  
## Running  
1. Clone this directory  
``` git clone https://github.com/3Gigs/nagdb ```  
2. Install depedencies  
``` npm install ```  
3. Compile typescript files  
``` npx tsc ```  
4. Make config.json and put all secret bot stuff here  
```  
{
    "clientId": "your client id", 
    "guildId":  "your guild id for registering local slash commands",
    "token":    "your bot token",
    "port":     "web server port" 
}
```  
5. Run bot  
``` node . ```  
### The Docker Way
1. Make sure Docker is [installed](https://docs.docker.com/)  
2. Build docker image  
```sh
docker build . -t nagdb
```
3. Run
```sh
docker run nagdb --name "nagdb_bot"
```

## Generate documentation
``` npx typedoc src/* ```  

## TODO
* Handling cases when the person requesting the music player is not in a vc
