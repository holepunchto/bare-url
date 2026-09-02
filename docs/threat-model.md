# Threat model

## What this is

`bare-url` is compiled into Bare. It is listed in `src/builtins.json`, so every Bare process has it. That holds whether or not the process sealed, and no code has to load anything to reach it.

So this addon is part of Bare, and [Bare's threat model](https://github.com/holepunchto/bare/blob/main/docs/threat-model.md) covers it. Read that one first. This one only says where this addon sits in it.

## What it inherits

- **The promise.** Bare promises a sealed process gets no new native code. This addon is native code that is already in, so the seal neither adds it nor takes it away.
- **The attacker.** Untrusted JavaScript in a sealed process. It writes what it likes, runs on as many threads as it wants, and calls anything it can reach in any order and all at once. It can reach all of this addon.
- **The trust.** This addon is trusted, because Bare compiles it in. Whatever you compile in is your security policy, and this is one of the things you picked.
- **The walls.** The same table applies. A thread is not a wall and neither is a realm, so nothing here gets to assume it is alone.
- **The rules.** What Bare says to report, and what Bare says is not a bug, is the same here.

## What counts

- **Counts:** `binding.c` and the JavaScript that ships with it. Sealed JavaScript reaches all of it without loading a thing.
- **Does not count:** tests, benchmarks, and scratch code.

## What this addon adds

WHATWG URL parsing and serialization, through [liburl](https://github.com/holepunchto/liburl).

It parses. It does not fetch, resolve or open anything, and holding a `URL` reaches nothing.

## Where the risk is

The C runs over strings that an attacker chose, and a URL is a big grammar. The sharp corners are the usual ones: percent decoding, host parsing, and IPv6 literals.

There is more than memory here. URLs are how the module system names things and how it picks a protocol for them. If this parser and whatever else looks at the same URL disagree, a decision gets made about one thing and applied to another. So a disagreement with the standard matters more than the parse itself suggests.

## What to report

- Memory bugs that JavaScript can reach, on any input string, invalid ones included
- Any input where the scheme, host, origin or path comes out different from what the WHATWG URL Standard says
- Allocation or stack growth that an input can drive without bound
- Anything on Bare's report list
