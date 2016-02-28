## Features ##

UFD has a few important design features:

  * Wraps and hides the original master <SELECT ..>, but proxies widget changes back to the master.  The form field submission will therefore have the original name submission.  This **unobtrusive** ethos is an important design decision.
  * UFD also triggers (some) events for event handlers on the original <SELECT ..>. This means the event handlers on the master are not dependant on the widget, and therefore your event handling is independent of the widget.  You can actually init then destroy the widget multiple times, toggling between native and UFD, without loosing the selection or the event handlers - Try on the demo page! Events fired currently are:  blur, focus, change.  A change event on the master will trigger back a selection change on the widget.
  * UFD uses a custom [trie](http://en.wikipedia.org/wiki/Trie) implementation for **fast filter** search ( v0.1-0.5: prefix search, v0.6+ infix search), even with large (1000+) item lists and iE6! The performance on _real_ browsers is even better. See [this post on the infix trie](http://blog.toolman.geek.nz/2010/03/infix-search-using-trie-data-structure.html) for details.
  * **fast** initialization and operation is important:  UFD is already fast enough to apply to all <SELECT..>s, even with forms with many dropdowns. On a developers' Firefox 3.5 on a 2.66Ghz CPU, the init time is roughly 20msec +(itemCount/4)msec: 10 item lists initialize in about 25msec, 100 items in about 50msec, 500 items in about 130msec,and 1000 item lists in about 250msec.  iE6 performance is 2-3 times slower. Try the demo pages' x-item construction timing to see if its fast enough for your needs.  Performance improvement suggestions welcomed.
  * Optional emphasis marking on text match, with associated performance hit.
  * skinnable, with jQuery UI themeroller support: v0.1-0.5: 1.7, v0.6+ 1.7 and 1.8 suport.
  * Easy to reload options from master to support dynamic list updates.
  * Supports duplicate option text (since 0.4).
  * z-index managed for iE6 support using bgiframe and root-node dropdown location.
  * Optional submission of free text: copy the master 'name' attribute to the text input, and suffix the master name.



## Limitations ##

Sounds great, but what about the _missing_ features that you might want to know about for your situation:

  * no <OPTGROUP ..> support.  Possible to implement.
  * no complex per-item content, such as multiple images or HTML.  A single block <LI .. > with background image, hover/active class and CSS is all you get - performance is more important sorry.
  * no support for multiple selection, i.e. <SELECT multiple .. >.  (_thetoolman_) doesn't recommend them as a good UI widget: ctrl + click for form entry? no thanks.  Use checkboxes or some better metaphor!
  * no JSON/ajax/ajax-autocomplete support. This is just a wrapper on a <SELECT.. > tag, so you can modify or inject new <OPTION ..>s to the master  _via any technique/tool you prefer_, then simply trigger a reload from that master <SELECT ..> :)
  * limited backwards compatibility with sexy-combo configuration, CSS, callbacks etc. if you are upgrading.  The transition should be easy however, as the included skins use the same file layout more or less.
  * many events are not passed on, such as key events.  Welcome use-case suggestions for  event mimicing of other types.
  * Not yet tested with screen-readers and other special access techniques.  Gladly accept suggestions, especially with the dummy ARIA-enabled themeroller test in the current demo page linked above.