// Online play settings. Edit this file, no code changes needed.
//
// turn: relay servers. Two players often cannot reach each other directly (mobile data, school or office
//   wifi, strict routers), and then a relay carries the game traffic between them. Without one, "lobby found
//   but connection failed" is the usual result. The entries below are the free public demo relay from
//   Open Relay (metered.ca). It is shared and limited, so for a real launch make a free account with
//   metered.ca or Cloudflare Calls, and replace these three with your own urls, username and credential.
//
// signalling: the matchmaking server that introduces players to each other. Leave it empty to use the free
//   public PeerJS server (0.peerjs.com), which is shared and sometimes slow or down. To run your own:
//   `npx peerjs --port 9000` on any small server, then set { host: 'your-server.com', port: 443, path: '/', secure: true }.
window.DOODLE_NET = {
  turn: [
    { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
    { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
    { urls: 'turns:openrelay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' },
  ],
  signalling: {},
};
