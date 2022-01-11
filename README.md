# Uno Zen Revised for Ghost

![Last version](https://img.shields.io/github/tag/MrGiga/uno-zen-revised.svg?style=flat-square)
![Build Status](https://github.com/MrGiga/uno-zen-revised/actions/workflows/master.yml/badge.svg)
![Ghost version](https://img.shields.io/badge/Ghost-4.x-brightgreen.svg?style=flat-square)
<!-- ![Node version](https://img.shields.io/node/v/uno-zen-revised.svg?style=flat-square) -->

> Minimalist and Elegant theme for Ghost.

<img src="http://i.imgur.com/LCSB4Ca.jpg">

- [Uno Zen Revised for Ghost](#uno-zen-revised-for-ghost)
  * [Introduction](#introduction)
    + [Whats is new in 2.x](#whats-is-new-in-2x)
  * [Installation](#installation)
  * [Update](#update)
    + [Update your current version](#update-your-current-version)
  * [Development and Customization](#development-and-customization)
  * [Related](#related)
  * [License](#license)

---

## Introduction

**Uno Zen Revised** is a theme for Ghost taken from the archived version of [Uno-Zen](https://github.com/Kikobeats/uno-zen) but includes compatibility with Ghost 4.0 and implemenation of Docker.

### Whats is new in 2.x

- Totally rewritten using HTML5 and CSS3.
- Improved development workflow with gulp + browersync.
- Improved responsive and mobile experience.
- Improved SEO Content with meta tags.

Things that already existed:

- A good [404 page error](http://kikobeats.com/404).
- Search support.
- Multiaccount support.
- Loading progress state for each page.
- Estimation about the time of reading.

You can see a [demo](http://kikobeats.com) in my own blog. Also you can check the [styleguide](http://kikobeats.com/styleguide) to view how it looks.

## Installation

Please ensure that `git` and `curl` is installed on your machine.

Enter the theme folder (`content/themes`) of your Ghost installation and paste the following command:

```bash
$ curl -sSL https://raw.githubusercontent.com/MrGiga/uno-zen-revised/master/scripts/install.sh | sh
```

### Alternative installation (to enable deployment to remote server):

Run the above command inside a temporary folder.

Delete the `.git` folder inside the `uno-zen` folder.

Copy and paste the `uno-zen-revised` folder into the theme folder (`content/themes`).

This will add a static copy of the theme to your blog's git repository and allow changes to be tracked by git.

## Setup

This theme needs a DOM selector library. The library is not provided by the theme. Instead, you need to paste one into the `Blog Footer` in the `Code injection` of your Ghost installation:

```html
<script type="text/javascript" src="https://code.jquery.com/jquery-1.11.3.min.js"></script>
```

You can use jQuery, but we recommend use [Zepto](https://github.com/madrobby/zepto), a lightweight jQuery alternative compatible with jQuery Plugins:

```html
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/zepto/1.1.6/zepto.min.js"></script>
<script>jQuery = Zepto</script>
```

It should look like this:

![](http://i.imgur.com/xUXdFeH.png)

## Update

One objective of this project is to adopt an effective policy to have the latest version of the theme all the time. An update script is included in the repository.

### Update your current version

Make sure you're in the uno-zen-revised directory. Then run:

```bash
$ sh scripts/update.sh
```

That's all!

## Development and Customization

See in [Documentation](https://github.com/MrGiga/uno-zen-revised/blob/master/DOCUMENTATION.md).

<!-- ## Showcase

<div align="center">
<a target="blank" href="http://johncurcio.com"><img src="http://i.imgur.com/crE8jt2.png"></a>
<a target="blank" href="http://www.evilsocket.net"><img src="http://i.imgur.com/qanAbQf.png"></a>
<a target="blank" href="http://pupboss.com"><img src="http://i.imgur.com/0AeVKgB.png"></a>
<a target="blank" href="http://robinz.in"><img src="http://i.imgur.com/qDAbrch.jpg" /></a>
</br>
</br>
.. and many, many more. <a href="https://github.com/Kikobeats/uno-zen/blob/master/SHOWCASE.md">See all</a>!.
</div> -->


## Related

* [Uno Zen](https://github.com/Kikobeats/uno-zen) – Archived version of Uno Zen.

## License

MIT © [MrGiga](johncurcio.com)
