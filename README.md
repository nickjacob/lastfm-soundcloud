# Last.fm/Soundcloud

## What?
I use Last.fm to find related artists, but then end up copying/pasting names into soundcloud. This is a bookmarklet that searches soundcloud's API for all artist names on the page

## How does it work
The code is all front-end, using soundcloud's javascript, client-side API. However, since I'm injecting a script into Last.fm and I need to have my origin as my domain (for soundcloud's api), I need to do cross-domain messaging. I use [EasyXDM](https://github.com/oyvindkinsey/easyXDM) for that. On my parent page, I scrape for artist links, identify them with an id, send the links to my "remote" (iframe) where I search soundcloud and send back the first result's data.

I've emulated/ripped off the soundcloud UI for artist-name hover; all it shows is the artist name, online status (online indicated with a green triangle), and number of followers. I'm getting all the data form the API though, so it could show more. Similarly, only clicking on the name in the popup will go to soundcloud (this is consistent with Soundcloud's UI).

## What else

* really messy code right now
* need to clean up/add more safety
* very dependent on Last.fm's front-end structure to scrape artist links... which is not at all semantic...(although they didn't change it for ~5 years, so...)
