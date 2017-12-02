---
layout: post
title:  "Twitter Bot Project"
date:   2017-11-30 17:27:59 -0400
description: "Bot script, written in python, which scrapes the News API and Google RSS feed for articles containing a specified term. Post details the process and provides a GitHub repo with sample code."
---

This project stems from a Twitter post from my good friend Andrew Naber, who jokingly suggested the creation of a bot that sends the 'Old Man Yells at Cloud' every time a news article about millennials appears on the web. Having just covered web scraping and APIs in my *Programming for Data Science* class, I happily obliged. Thanks to <a href="https://www.linkedin.com/in/noah-diekemper-46152492/">Noah Diekemper</a> for introducing and demoing the News API.

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">I want to write a bot script, where it finds if the keyword of an article is, &quot;Millennial&quot;, and it sends the &quot;Old Man Yells at Cloud&quot; pic. <a href="https://t.co/8arrCRftTu">pic.twitter.com/8arrCRftTu</a></p>&mdash; Andrew M Naber (@AndrewMNaber) <a href="https://twitter.com/AndrewMNaber/status/927972980210139138?ref_src=twsrc%5Etfw">November 7, 2017</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

<blockquote class="twitter-tweet" data-conversation="none" data-lang="en"><p lang="en" dir="ltr">Your wish is my command. I will use <a href="https://t.co/mcZDHOZiQW">https://t.co/mcZDHOZiQW</a> &amp; twitter for my programming for Data Science class to create this.</p>&mdash; Anthony Lipphardt (@a_lipphardt) <a href="https://twitter.com/a_lipphardt/status/929080275715461120?ref_src=twsrc%5Etfw">November 10, 2017</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>


This twitter bot, written in python, is configured to search for a given a term - 'millennial' in this case - and scrapes the News API and Google RSS feed for articles containing that term. Long URLs are passed to the Bitly API for shortening and a status update with media (e.g., 'Old Man Yells at Cloud' picture) is then posted to the given Twitter profile using the Tweepy python library.

Code for this project is included in my [twitterbot repo](https://github.com/alipphardt/twitterbot) on GitHub. Access keys/tokens have been removed from the script. In order to get the script to work, developer tokens must be requested from [Twitter](https://developer.twitter.com/) and [Bitly](https://dev.bitly.com/) and copied into the script. 

An example of the Twitter-bot using this script can be found at [https://twitter.com/millennialYell](https://twitter.com/millennialYell).

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr"><a href="https://t.co/6OL1w0w9gu">https://t.co/6OL1w0w9gu</a> Millennials Plan to Redefine the C-Suite <a href="https://t.co/fEY6byHQUU">pic.twitter.com/fEY6byHQUU</a></p>&mdash; Grandpa Simpson (@millennialYell) <a href="https://twitter.com/millennialYell/status/936279603089412096?ref_src=twsrc%5Etfw">November 30, 2017</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

In order to run the script on a schedule, I use the hosting service [pythonanywhere.com](http://www.pythonanywhere.com) which supports running of python scripts. Free accounts are currently available and include one daily scheduled task.

The first version of this bot is limited in that it only posts the shortened bitly link and the article title. Future improvements might include:
* **Code Refactoring** - Improve readability and usability of code, specifically by creating a **Bot** class which can be configured when instantiated with term and persona settings, as well as encapsulating key functions such as scraping and tweeting.
* **Inclusion of twitter handle for author organization** - Lookup tables could be stored and queried via SQLite, mapping domain names (e.g. cnn.com) to twitter handles (e.g. @CNN). If a mapping does not exist enter a record for the domain which would then be filled at a later time. At the moment, the Twitter API  doesn't seem to have the capability to search and return user IDs, so the process of adding the twitter handles would be manual in nature.
* **Automated quotes for bot persona depending on article title** - This might be accomplished through some basic machine learning algorithms such as decision trees. Potentially a good project for next semesters *Machine Learning* class.