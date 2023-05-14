import makeWASocket,{DisconnectReason, useMultiFileAuthState} from "@adiwajshing/baileys";
import {Boom} from '@hapi/boom'

async function connectionToWhatsApp(){
    const{state, saveCreds} = await useMultiFileAuthState('auth');
    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state
    });

     sock.ev.on('creds.update', saveCreds)
     sock.ev.on('connection.update',(update)=>{
        const{connection, lastDisconnect} = update
        if(connection == 'close'){
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('connection closed due to ', lastDisconnect?.error, '.reconnecting', shouldReconnect)
           if(shouldReconnect){
            connectionToWhatsApp()
           }
        }
        else if(connection === 'open'){
            console.log('opened Connection')
        }
     });
     sock.ev.on('messages.upsert', async m => {
       console.log(JSON.stringify(m, undefined, 2))
       console.log('replying to', m.messages[0].key.remoteJid)
       await sock.sendMessage(m.messages[0].key.remoteJid!,{text: 'Hello There!'})
     })
}

connectionToWhatsApp();
