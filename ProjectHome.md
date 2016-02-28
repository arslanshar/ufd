# UFD: the Unobtrusive Fast-filter Dropdown #

## Introduction ##

UFD is a jQuery UI widget/plugin to wrap and progressively enhance standard HTML <SELECT ...> dropdown.  In addition to all regular key and mouse inputs, the dropdown features a _fast_ text-type list-filter engineered to handle _very_ large item count select lists.

UFD wraps and hides the original master <SELECT ..>, but proxies widget changes back to the master. UFD also triggers (some) events on the master, so event handlers on the master are independent on the widget.  You can actually initialize then destroy the widget multiple times, toggling between native and UFD, without loosing the selection or the event handlers - Try on the demo page! A change event on the master will trigger back a selection change on the widget.

#### This **unobtrusive** ethos is an important design decision ####

The widget is build with fast init times and fast performance in mind. It's unobtrusive construction and emulation of the originals dimensions and margins makes it easily drop in to existing projects.

![http://ufd.googlecode.com/svn/wiki/ufd.png](http://ufd.googlecode.com/svn/wiki/ufd.png)

How large a list can it manage? Thousands, even in iE6!

You can even use the [Bookmarklet](Bookmarklet.md) to get a no-install test of UFD on any page you like.

## Demonstration ##

You can also try the demonstration pages to test performance, filtering, and other great features.

  * The [latest stable release (0.6)](http://ufd.googlecode.com/svn/tags/0.6/examples/index.html).
  * The current head [unstable development](http://ufd.googlecode.com/svn/trunk/examples/index.html).


## Browser compatibility ##

UFD has been tested on the following browsers:

  * Internet Explorer 6 (Win)
  * Internet Explorer 8 (Win)
  * Firefox 3.5 (Win)
  * Firefox 3.5 (Linux)
  * Safari on iPhone 3.1 useable:  Standard text input filter works, click on list item works. No cursor keys == no cursor navigation. No scrollbar on list, so you have to filter till item visible on list. Minor render bugs. Suggestions welcome on fixes here.
  * Your browser? Tell us if it works or doesn't work for you.   Minor render quirks, and


The developers welcome bug reports on any browser bug.  Patches or code suggestions are also welcome.

## License ##

The source includes both GPL v2 and MIT licenses, your preference.  Basically, do what you like with it.  Feedback, issues and fixes welcomed.

## History ##

The _Unobtrusive Fast-filter Dropdown_ (UFD) is a fork from [sexy-combo](http://code.google.com/p/sexy-combo/).