---
outline: deep
---

# Networking

The stuff that makes the internet work. If you've ever wondered what actually happens when you type a URL into your browser, or why your app can't connect to a database, this is the place.

## The Internet - What Even Is It?

At its core, the internet is just a massive network of interconnected computers that agree on a set of rules (protocols) for talking to each other. Your device connects to your router, your router connects to your ISP, your ISP connects to bigger networks, and so on up the chain until everything is linked together via a backbone of undersea cables, satellites, and data centres.

When you "visit a website", your computer is really just sending a message across this network asking another computer (a server) to send some data back. That's it. Everything else is just layers of abstraction on top of that basic idea.

## TCP/IP & The Layers

Networking is often explained using a layered model. You'll hear people reference the **OSI model** (7 layers) or the **TCP/IP model** (4 layers). The TCP/IP model is the one that actually maps to how the internet works in practice, but the OSI model is still worth knowing as it comes up all the time in interviews, certifications, and documentation.

### The OSI Model (7 Layers)

The OSI (Open Systems Interconnection) model is more of a conceptual framework than something directly implemented. It breaks networking into 7 layers, each with a specific responsibility. A common mnemonic to remember them top-down is **All People Seem To Need Data Processing**.

| #   | Layer            | What It Does                                                                 | Example Protocols / Tech           |
| --- | ---------------- | :--------------------------------------------------------------------------- | ---------------------------------: |
| 7   | **Application**  | What the end user interacts with — browsers, email clients, APIs             | HTTP, HTTPS, FTP, SMTP, DNS        |
| 6   | **Presentation** | Data formatting, encryption, compression — makes sure both sides understand the data | SSL/TLS, JPEG, JSON, ASCII   |
| 5   | **Session**      | Manages sessions / connections between applications — opening, maintaining, closing | NetBIOS, RPC, PPTP           |
| 4   | **Transport**    | Reliable (or fast) delivery of data between hosts                            | TCP, UDP                           |
| 3   | **Network**      | Addressing and routing packets across different networks                     | IP (IPv4, IPv6), ICMP, routers     |
| 2   | **Data Link**    | Handles communication between devices on the same local network              | Ethernet, Wi-Fi (802.11), MAC, switches |
| 1   | **Physical**     | The actual hardware — electrical signals, cables, radio waves                | Cables, fibre optics, hubs, NICs   |

When people say things like "Layer 7 load balancer" or "Layer 3 switch", they're referencing this model. A Layer 7 load balancer can inspect HTTP headers and route based on URL paths, while a Layer 3 device only deals with IP addresses.

### The TCP/IP Model (4 Layers)

The TCP/IP model is a simpler, more practical version that maps directly to how the internet actually works. It essentially squashes the OSI layers together.

| TCP/IP Layer       | OSI Equivalent         | What It Does                                                                 | Example Protocols / Tech     |
| ------------------ | :--------------------- | :--------------------------------------------------------------------------- | ---------------------------: |
| **Application**    | Application + Presentation + Session | The stuff you actually interact with — web pages, emails, file transfers     | HTTP, HTTPS, DNS, FTP, SMTP  |
| **Transport**      | Transport              | Manages how data gets delivered — reliably (TCP) or fast (UDP)               | TCP, UDP                     |
| **Internet**       | Network                | Handles addressing and routing packets across networks                       | IP (IPv4, IPv6), ICMP        |
| **Network Access** | Data Link + Physical   | The physical stuff — cables, Wi-Fi signals, MAC addresses                    | Ethernet, Wi-Fi, ARP         |

Think of it like sending a letter. The **Application** layer is the letter itself (the content). The **Transport** layer is the envelope and the decision of whether to send it tracked or untracked. The **Internet** layer is the postal address. The **Network Access** layer is the actual van driving it there.

### How Data Actually Travels — A Packet's Journey

Let's say your app makes an API call and sends some JSON to a server. What actually happens to that data as it moves through the layers?

```json
{ "name": "Hector", "action": "save" }
```

**Step 1 — Application Layer (HTTP)**

Your app wraps the JSON in an HTTP request. This adds things like the method, URL, headers, and content type. At this point you've got something like:

```
POST /api/users HTTP/1.1
Host: api.myapp.com
Content-Type: application/json

{ "name": "Hector", "action": "save" }
```

**Step 2 — Transport Layer (TCP)**

TCP takes the whole HTTP message and breaks it into **segments**. Each segment gets a TCP header slapped on the front containing the source port, destination port (443 for HTTPS), a sequence number (so the other end can reassemble them in order), and checksums for error detection. If the message is small enough it might stay as one segment; if it's large, TCP chops it up.

```
[ TCP Header | HTTP data (or a chunk of it) ]
```

This is also where the three-way handshake happens (SYN → SYN-ACK → ACK) to establish the connection before any data is sent.

**Step 3 — Internet Layer (IP)**

Each TCP segment gets wrapped in an **IP packet**. The IP header adds the source IP (your machine) and destination IP (the server). This is what routers use to forward the packet across the internet — each router looks at the destination IP and decides where to send it next, hop by hop, until it reaches the right network.

```
[ IP Header | TCP Header | HTTP data ]
```

**Step 4 — Network Access Layer (Ethernet / Wi-Fi)**

Finally, the IP packet gets wrapped in a **frame** for whatever physical network you're on. This adds a MAC address header (the hardware address of the next device in the chain — your router, usually) and a trailer for error checking. This frame is then converted into actual electrical signals on a cable, or radio waves over Wi-Fi, and sent out.

```
[ Frame Header (MAC) | IP Header | TCP Header | HTTP data | Frame Trailer ]
```

**What it looks like visually — encapsulation:**

```
Your JSON data
  └─ wrapped in an HTTP request        (Application)
      └─ wrapped in a TCP segment       (Transport)
          └─ wrapped in an IP packet    (Internet)
              └─ wrapped in a frame     (Network Access)
                  └─ sent as electrical signals / radio waves
```

Each layer wraps the previous one like a Russian doll — this is called **encapsulation**. When the data arrives at the server, the process happens in reverse: each layer strips off its header, reads what it needs, and passes the rest up to the next layer. By the time it reaches the server's application layer, it's back to being your original HTTP request with the JSON body.

If TCP detects that a segment went missing (no acknowledgement came back), it resends it. If a packet arrives out of order, TCP uses the sequence numbers to put everything back together. The application layer never has to worry about any of this — it just gets the complete JSON.

### TCP vs UDP

- **TCP (Transmission Control Protocol)** — Reliable, ordered delivery. It establishes a connection first (the famous "three-way handshake": SYN, SYN-ACK, ACK), checks that all packets arrive, and resends any that get lost. Used for things where accuracy matters: web pages, APIs, file transfers.
- **UDP (User Datagram Protocol)** — Fire and forget. No connection setup, no guarantees. Much faster but packets can arrive out of order or not at all. Used where speed beats accuracy: video streaming, gaming, DNS lookups.

## IP Addresses

An IP address is just a unique identifier for a device on a network. It's how machines find each other.

- **IPv4** — The classic format: `192.168.1.1`. Four groups of numbers (0–255) separated by dots. Gives us roughly 4.3 billion addresses, which we've basically run out of.
- **IPv6** — The newer format: `2001:0db8:85a3:0000:0000:8a2e:0370:7334`. Much longer, supports a practically unlimited number of addresses.
- **Public IP** — Your address on the wider internet, assigned by your ISP.
- **Private IP** — Your address within a local network (e.g. `192.168.x.x`, `10.x.x.x`). Not routable on the public internet.
- **Loopback** — `127.0.0.1` (or `localhost`). Points back to your own machine.

### Ports

An IP address gets you to the right machine, but a **port** gets you to the right application on that machine. Think of the IP as the building address and the port as the flat number.

- `80` — HTTP
- `443` — HTTPS
- `22` — SSH
- `5432` — PostgreSQL (you'll know this one well by now)
- `3000`, `3001`, `5173` — Common dev server ports

A full address looks like `192.168.1.10:3000` — that's the machine at `192.168.1.10`, specifically the app listening on port `3000`.

## HTTP & HTTPS

**HTTP (HyperText Transfer Protocol)** is the protocol your browser uses to request and receive web content. It's a request-response model: the client sends a request, the server sends back a response.

### The Request

A basic HTTP request has:

- **Method** — What you want to do: `GET` (read), `POST` (create), `PUT` (update), `PATCH` (partial update), `DELETE` (remove)
- **URL** — Where you want to do it: `https://api.example.com/users/123`
- **Headers** — Metadata: authentication tokens, content type, caching directives
- **Body** — The payload (for POST/PUT/PATCH): usually JSON

### The Response

- **Status Code** — How it went: `200` (OK), `201` (Created), `301` (Redirect), `400` (Bad Request), `401` (Unauthorized), `403` (Forbidden), `404` (Not Found), `500` (Server Error)
- **Headers** — Metadata about the response
- **Body** — The actual data

### HTTPS, SSL & TLS

**HTTPS** is just HTTP with encryption. The "S" stands for Secure. It uses **TLS (Transport Layer Security)** to encrypt the connection between client and server so nobody in the middle can read or tamper with the data.

You'll sometimes hear **SSL (Secure Sockets Layer)** mentioned — that's the predecessor to TLS. SSL is technically deprecated, but people still use the term "SSL certificate" to mean a TLS certificate. They're the same thing in practice.

**How the TLS handshake works (simplified):**

1. Client says hello, sends supported encryption methods
2. Server picks an encryption method, sends back its **SSL/TLS certificate** (which contains the server's public key)
3. Client verifies the certificate is legit (signed by a trusted Certificate Authority)
4. They agree on a shared session key using asymmetric encryption
5. All further communication is encrypted with that session key (symmetric encryption — much faster)

This is why you see the padlock icon in your browser. No padlock = no encryption = don't enter your password.

## DNS - The Phonebook of the Internet

**DNS (Domain Name System)** translates human-friendly domain names (`google.com`) into IP addresses (`142.250.187.206`) that machines can actually route to.

When you type a URL into your browser:

1. Browser checks its local cache
2. If not found, asks the OS resolver
3. OS asks a **recursive DNS resolver** (usually your ISP's, or something like Cloudflare's `1.1.1.1` or Google's `8.8.8.8`)
4. The resolver works its way through the DNS hierarchy: **Root server** → **TLD server** (.com, .io, etc.) → **Authoritative nameserver** for the domain
5. The authoritative nameserver responds with the IP
6. That IP is cached at various levels for future lookups

### DNS Record Types

| Record  | What It Does                                                                                      |
| ------- | :------------------------------------------------------------------------------------------------ |
| **A**     | Maps a domain to an IPv4 address. `example.com → 93.184.216.34`                                |
| **AAAA**  | Maps a domain to an IPv6 address                                                                |
| **CNAME** | Alias — points one domain to another domain. `www.example.com → example.com`                    |
| **MX**    | Mail exchange — where to deliver email for this domain                                          |
| **TXT**   | Arbitrary text, often used for domain verification or SPF/DKIM email auth                       |
| **NS**    | Nameserver — which DNS servers are authoritative for this domain                                |

### CNAME Records in Practice

CNAME records are the ones you'll encounter most when setting up third-party services. The core idea is simple: you own your domain, but some third-party service (Clerk, Vercel, SendGrid, etc.) owns the infrastructure that actually handles the request. A CNAME is the glue that connects the two — your users hit your domain, but under the hood DNS resolves it to the third-party's servers. The user never sees the provider's domain in their browser, it all looks like yours, but the provider is the one doing the heavy lifting.

**Clerk example:** Say you're using Clerk for auth and you want the login flow to live at `auth.yourapp.com` rather than some `clerk.dev` URL. Clerk's servers are the ones actually handling authentication, but you still need a way for `auth.yourapp.com` to resolve to their infrastructure. So you add a CNAME record: `auth.yourapp.com` → `frontend-api.clerk.dev`. Now when a browser hits `auth.yourapp.com`, DNS says "go look up `frontend-api.clerk.dev` instead", the request ends up at Clerk's servers, but the user only ever sees your domain. Your branding stays intact, Clerk does the work.

**Vercel / similar platforms:** Same pattern. You add a CNAME for `www.yourapp.com` → `cname.vercel-dns.com` and Vercel handles the rest. You own the domain, they own the servers.

**The www example:** You'll often see `www.example.com` set up as a CNAME pointing to `example.com`. That's because `www.example.com` is technically a different domain (a subdomain) to `example.com`. The root domain gets an A record pointing at the actual server IP, and `www` gets a CNAME that says "just go look up `example.com`". Both end up at the same place. You *could* just give `www` its own A record with the same IP — that works too. But the CNAME approach means if the server IP ever changes, you only update one A record and the CNAME follows automatically. With two A records you'd have to update both. Not a big deal for one subdomain, but when you've got `blog.`, `api.`, `docs.`, `auth.` all pointing at the same server, updating one record beats updating twenty.

**Important caveat:** You can't put a CNAME on the root domain (`yourapp.com` without the `www`). That's a DNS spec limitation. Some providers like Cloudflare and Route 53 get around this with "ALIAS" or "ANAME" records which behave similarly but aren't technically CNAMEs.

### Route 53

**Amazon Route 53** is AWS's DNS service. It's called Route 53 because DNS runs on port 53. It lets you:

- Register domains
- Manage DNS records (A, CNAME, MX, etc.)
- Route traffic using policies (latency-based, geolocation, weighted, failover)
- Health-check your endpoints and route around failures

It's also where those ALIAS records come in handy for pointing root domains at load balancers, CloudFront distributions, S3 buckets, etc.

### Why Do You Need a DNS Provider at All?

A CNAME record has to live *somewhere*. When you register a domain, you need a DNS service that's **authoritative** for it — meaning it's the place the rest of the internet goes to when it needs to resolve your domain's records. Route 53 is just AWS's version of this. You could equally use Cloudflare, Namecheap's DNS, Google Cloud DNS, or any other provider.

Going back to the Clerk example: without a DNS provider, there's nowhere to put the CNAME record that says `auth.myapp.com` → `frontend-api.clerk.dev`. A user's browser would ask DNS "where is `auth.myapp.com`?" and get nothing back — it'd just fail. Route 53 (or whichever provider you use) is where that record lives so the rest of the DNS system can find it. Route 53 isn't specifically *required* for Clerk — any DNS provider works. It's just the natural choice if you're already in the AWS ecosystem.

## VPCs, Subnets & Security Groups

This is the bread and butter of cloud networking, particularly on AWS but the concepts apply everywhere.

### VPC (Virtual Private Cloud)

A **VPC** is your own isolated section of the cloud. Think of it as your own private data centre within AWS (or any cloud provider). Nothing gets in or out unless you explicitly allow it.

When you create a VPC, you define an IP range for it using **CIDR notation** — e.g. `10.0.0.0/16` gives you 65,536 IP addresses to play with within that VPC.

### Subnets

A **subnet** is a subdivision of your VPC. You split your big IP range into smaller chunks and place them in specific **availability zones** (physical data centres).

- **Public subnet** — Has a route to an **Internet Gateway**, so resources in here can talk to the internet. This is where you'd put a load balancer or a bastion host.
- **Private subnet** — No direct internet access. This is where your application servers and databases live. They can still reach the internet *outbound* via a **NAT Gateway** if needed (e.g. to pull packages or call external APIs), but nothing from the outside can reach in.

A typical setup:

```
VPC (10.0.0.0/16)
├── Public Subnet  (10.0.1.0/24) — AZ-a — Load Balancer, NAT Gateway
├── Public Subnet  (10.0.2.0/24) — AZ-b — Load Balancer (redundancy)
├── Private Subnet (10.0.3.0/24) — AZ-a — App Servers, Containers
├── Private Subnet (10.0.4.0/24) — AZ-b — App Servers (redundancy)
├── Private Subnet (10.0.5.0/24) — AZ-a — Database (primary)
└── Private Subnet (10.0.6.0/24) — AZ-b — Database (replica)
```

### CIDR Notation

CIDR (Classless Inter-Domain Routing) is just a way of expressing an IP range. The number after the `/` tells you how many bits of the address are fixed.

- `10.0.0.0/16` — The first 16 bits are fixed → 65,536 addresses
- `10.0.1.0/24` — The first 24 bits are fixed → 256 addresses
- `10.0.1.0/28` — The first 28 bits are fixed → 16 addresses

Smaller number after the slash = bigger range.

### OK but Why 10.x.x.x? Why Not Just Any Number?

Right so an IPv4 address is four numbers from 0–255, which means in theory you've got addresses from `0.0.0.0` all the way to `255.255.255.255`. But not all of those are up for grabs. Way back in the day (RFC 1918, 1996), a chunk of the total address space was **reserved specifically for private networks** — meaning these addresses will never be used on the public internet. They're exclusively for internal use: your home Wi-Fi, your office LAN, your AWS VPC, etc.

The three reserved private ranges are:

| Range                       | CIDR            | Number of Addresses | Typical Use                       |
| --------------------------- | :-------------- | ------------------: | --------------------------------: |
| `10.0.0.0` – `10.255.255.255`       | `10.0.0.0/8`   |          16,777,216 | Cloud VPCs, large corporate networks |
| `172.16.0.0` – `172.31.255.255`     | `172.16.0.0/12` |           1,048,576 | Medium-sized networks             |
| `192.168.0.0` – `192.168.255.255`   | `192.168.0.0/16`|              65,536 | Home routers, small networks      |

That `192.168.x.x` one should look familiar — it's what your home router assigns to your devices. And `10.x.x.x` is the big one, which is why it's the go-to for cloud providers. With over 16 million addresses in that range, it gives you plenty of room to carve up into VPCs and subnets.

**So why does `10` matter?** It doesn't mean anything special mathematically — it's just the number the internet standards body decided to set aside. The important thing is that routers on the public internet **know to never route these addresses**. If a packet shows up with a destination of `10.0.3.47`, the public internet goes "that's not mine, drop it". This is what keeps your private network private.

**Why this matters for VPCs:** When you create a VPC with `10.0.0.0/16`, you're saying "give me all addresses from `10.0.0.0` to `10.0.255.255` for my private cloud network". You then carve that up into subnets (`10.0.1.0/24` = 256 addresses, `10.0.2.0/24` = another 256, etc.). None of these addresses are reachable from the internet directly — which is the whole point. Your public-facing resources get a separate public IP that NATs (translates) to their private IP behind the scenes.

You could use `172.16.x.x` or `192.168.x.x` for your VPC too — they're all valid private ranges. But `10.x.x.x` is the convention for cloud stuff because it gives you the most room.

### Security Groups & NACLs

- **Security Group** — A virtual firewall attached to a resource (e.g. an EC2 instance or RDS database). You define inbound and outbound rules. Stateful — if you allow traffic in, the response is automatically allowed out.
- **NACL (Network Access Control List)** — A firewall at the subnet level. Stateless — you have to explicitly allow both inbound and outbound. Less commonly tweaked but useful as an extra layer.

Example: your database security group might only allow inbound traffic on port `5432` from the security group attached to your app servers. That means only your app can talk to the DB — nothing else.

## Network Hardware

It's worth knowing what the actual physical devices are that make all of this work. These sit at different layers of the network and do very different jobs.

### Hub

The dumbest device on this list. A hub receives data on one port and blindly blasts it out to **every other port**. It has no idea who the data is intended for — every device connected to the hub sees every packet. This creates a lot of unnecessary traffic and collisions. You won't really see these anymore, they've been replaced by switches.

### Switch

A switch is the smarter version of a hub. It operates at **Layer 2 (Data Link)** and maintains a table of MAC addresses, so it knows which device is connected to which port. When a frame comes in, the switch reads the destination MAC address and forwards it **only to the correct port**. This is why your home and office networks actually work efficiently. Managed switches (like the ones built into UniFi gear) also let you do things like VLANs, port mirroring, and traffic prioritisation.

### Router

A router operates at **Layer 3 (Network)** and is responsible for routing traffic **between different networks**. Your home router connects your private local network (`192.168.x.x`) to your ISP's network and ultimately the internet. It does this using **NAT (Network Address Translation)** — translating your devices' private IPs to a single public IP on the way out, and routing responses back to the right device on the way in.

### Access Point (AP)

An access point provides **Wi-Fi connectivity** to your network. It bridges wireless devices to your wired network. A standalone AP (like the **UniFi U6 Lite**) is different from a consumer Wi-Fi router — it doesn't do routing or NAT, it just handles the wireless side and plugs into your switch/router via Ethernet. This separation is what lets you place APs around your home for better coverage without creating separate networks.

### Patch Panel

A patch panel is a passive device — no electronics, no power, no smarts. It's basically a tidy termination point for all the Ethernet cables you've run through your walls. Instead of having cables dangling everywhere, each one terminates at a numbered port on the panel. You then use short patch cables to connect specific ports to your switch. It makes it easy to reorganise, label, and troubleshoot your cabling without touching the in-wall runs.

### Firewall / Gateway

A firewall inspects traffic and applies rules to allow or block it. In the consumer/prosumer world, the router and firewall are usually the same box. The **Ubiquiti Dream Machine Pro (UDM Pro)** is a good example — it's a router, switch, firewall, and UniFi controller all rolled into one. It handles NAT, runs IDS/IPS (Intrusion Detection/Prevention), manages your VLANs, and acts as the gateway between your LAN and the internet.

### Ports vs Firewalls — How They Work Together

A **port** is just a numbered doorway on a machine where a specific service is listening. Port `443` is the door for HTTPS, port `5432` is the door for PostgreSQL, port `22` is the door for SSH, and so on. If nothing is listening on a port, the door is effectively closed — there's nobody home to answer.

A **firewall** is the bouncer standing in front of all the doors. Even if a service *is* listening on a port, the firewall can say "nope, you're not allowed through" based on its rules — where the traffic is coming from, what port it's trying to reach, what protocol it's using, etc. The port is the entrance, the firewall decides who gets to use it.

Think of it like a harbour. The port is the dock where ships can pull in, and the firewall is the harbour authority that checks every incoming vessel and decides whether it's allowed to dock or gets turned away. A dock can exist but still have no ships allowed in.

As a practical example: say you've got a Postgres database running on port `5432` on a server in your network. The port is open from the service's perspective — Postgres is listening and ready. But the firewall rules on your UDM Pro (or your cloud security group) can block all external traffic to that port, so only devices on your local network can connect. The port is there, but the firewall shuts the gate for everyone else.

### A Typical Home Setup (UniFi Example)

```
Internet
  └─ ISP Router/Modem (public IP from ISP)
      └─ UDM Pro (router, firewall, switch, UniFi controller)
          └─ Patch Panel
              ├─ U6 Lite Access Point (Wi-Fi)
              ├─ Desktop PC (wired)
              ├─ NAS (wired)
              └─ Other devices...
```

### The Double NAT Problem

If your ISP gives you a router/modem combo (which most do), and you then plug your UDM Pro into it, you've got **two devices both doing NAT**. Your ISP's router translates your UDM Pro's IP to a public IP, and then the UDM Pro translates your devices' IPs to its own IP. That's two layers of address translation — **double NAT**.

For basic browsing this works fine, but it can cause issues with:

- **Port forwarding** — You'd have to forward ports on *both* devices
- **VPNs** — Some VPN protocols struggle with double NAT
- **Gaming / P2P** — Anything that needs inbound connections can have trouble
- **UPnP** — Automatic port mapping gets confused with two NAT layers

**Fixes:**

- **Bridge mode** — Put the ISP router into bridge/modem-only mode. This disables its NAT and routing so it just passes the public IP straight through to your UDM Pro. The UDM Pro then handles everything. This is the cleanest solution.
- **DMZ** — If bridge mode isn't available, set the ISP router's DMZ to point at your UDM Pro's IP. This forwards all traffic to the UDM Pro, effectively bypassing the first NAT for inbound connections (though it's still technically double NAT).

## Putting It All Together

When a user visits `https://yourapp.com`:

1. **DNS** resolves `yourapp.com` to an IP (maybe via a CNAME → load balancer)
2. **TLS handshake** establishes an encrypted connection
3. **HTTP request** travels over **TCP** to port `443`
4. Request hits your **load balancer** in a **public subnet**
5. Load balancer forwards to an **app server** in a **private subnet**
6. App server queries a **database** in another **private subnet** (allowed by **security group** rules)
7. Response flows back the same way, encrypted end-to-end

And that's basically it. A lot of layers of abstraction, but fundamentally just computers sending messages to each other following agreed-upon rules.

## Additional Resources

- [What is a canonical name (CNAME) and how does it work? - TechTarget](https://www.techtarget.com/searchwindowsserver/definition/canonical-name)
