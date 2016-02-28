# Introduction #

The _Unobtrusive Fast-filter Dropdown_ (UFD) is a fork from [sexy-combo](http://code.google.com/p/sexy-combo/).  This page explains the rationale.


# Details #

The main developer of UFD initially intended to enrich the sexy-combo for all its current users in a few important areas:

  * Performance with large lists
  * Improved event handling
  * Better iE6 z-index support

During the development of these improvements, lots of features had to be dropped or changed.  The new plugin ended up not being compatible with the previous versions in a few ways, and the plugin is in effect quite different.

Some of the potentially important **removed** features include:

  * Multiple selection in a single combo (ie <select multiple .. >)
  * Custom filter functions (UFD uses a [trie](http://en.wikipedia.org/wiki/Trie) implementation)
  * Backwards compatibility with CSS skins
  * Many configuration options
  * JSON support (might be reintroduced)
  * Custom callbacks (UFD triggers events on original select instead)

Some of these may be re-inserted in time, but the implementation and motivation has changed lots from sexy-combo.

Sexy-combo also had some releases sponsored by a company, and removal of features that may be important to them seems unfair.  And finally, the name sexy-combo name may be a minus for the more conservative uses (corporate etc.).

For these reasons, it seemed better to fork the project, hence the "Unobtrusive Fast-filter Dropdown" was born.

Why the fork not?