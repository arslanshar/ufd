# Introduction #

This bookmarklet will allow you to try out UFD on any web page you like with no installation!  The bookmarklet script will automatically inject all the needed script and CSS, and wrap all (non-multi) select drop-downs.

It is only modifying the local page, and is discarded on page refresh etc.  All forms should still submit completely correctly - remember that the _U_ stands for _Unobtrusive_.

Unless you are using Internet Explorer, simply drag the link below on to your bookmark bar, visit the target website, then select the bookmarklet.  If you want this in iE, you need to create the bookmarklet manually.  Create a new bookmark to anywhere, and replace the bookmarks' URL with the link URL/href below.  You can get this with a _right click -> copy shortcut_ on the link.


&lt;wiki:gadget url="http://ufd.googlecode.com/svn/trunk/bookmarklet/bookmarkletGaget.xml" height="20" width="200" border="0" /&gt;

The script will apply itself to all **non-multi** select tags, i.e.

`jQuery("select:not([multiple])").ufd();`



# Known issues #

  * In a few situations, the CSS styles on target pages may bleed into plugin elements, causing slight render weirdness.  For example, when the search select above gets UFDed, it gets extra left and right border width due to the wrapping span tag inheriting padding in that location.  It still functions correctly, of course.  Try it out!
    * iE seems to fail sometimes, still investigating.
  * Quirks mode changes the box model on a few elements, causing render bugs similar to the CSS bleed in. Corrected in supported browsers with (vendor-prefix)box-sizing.

