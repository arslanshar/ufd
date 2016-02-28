# Installation #

You will need to link to a couple of script files:
  * jQuery-x.x.js (>=1.3.0)
  * jQuery ui.core.js (1.8 support in v0.6+ only)
  * jquery.ui.ufd.js

In addition, you will want 2+ CSS files; one base file, and 1 per skin.
  * ufd-base.css
  * plain.css

See the example pages for a demonstration.

# Usage #

Like all jQuery plugins and widgets, you select your target nodes with a css selector, then pass options, thusly:

```

<select id="demo">
  <option>only 1</option>
</select>

<script type="text/javascript">
  $("#demo").ufd({option1:value, ...});
</script>

```

The optional option object overrides the default options.  Defaults as listed below:

```
skin: "plain", // skin name 
prefix: "ufd-", // prefix for pseudo-dropdown text input name attr.  
dropDownID: "ufd-container", // ID for a root-child node for storing dropdown lists. avoids ie6 zindex issues by being at top of tree.
logSelector: "#log", // selector string to write log into, if present.
mimicCSS: ["float", "tabindex", "marginLeft","marginTop","marginRight","marginBottom"], //copy these properties to widget. Width auto-copied unless min/manual.
moveAttrs: ["tabindex", "title"], // attributes to move from select to text input

infix: true, //infix search, not prefix 
addEmphasis: false, // add <EM> tags around matches.
caseSensitive: false, // case sensitive search 
submitFreeText: false, // re[name] original select, give text input the selects' original [name], and allow unmatched entries  
homeEndForCursor: false, // should home/end affect dropdown or move cursor?
allowLR: false, // show horizontal scrollbar
calculateZIndex: false, // {max ancestor} + 1
useUiCss: false, // use jquery UI themeroller classes. 
log: false, // log to firebug console (if available) and logSelector (if it exists)
unwrapForCSS: false, // unwrap select on reload to get % right on units etc. unwrap causes flicker on reload in iE6
listWidthFixed: true, // List width matches widget? If false, list can be wider to fit item width, but uses min-width so no iE6 support.  

polling: 250, // poll msec to test disabled, dimensioned state of master. 0 to disable polling, but needed for (initially) hidden fields. 
listMaxVisible: 10, // number of visible items
minWidth: 50, // don't autosize smaller then this.
maxWidth: null, // null, or don't autosize larger then this.
manualWidth: null, //override selectbox width; set explicit width - stops flicker on reload in iE6 (unless unwrapForCSS) as no unwrap needed
viewAhead: 1, // items ahead to keep in view when cursor scrolling
pageLength: 10, // number of visible items jumped on pgup/pgdown.
delayFilter: ($.support.style) ? 1 : 150, // msec to wait before starting filter (or get cancelled); long for IE 
delayYield: 1, // msec to yield for 2nd 1/2 of filter re-entry cancel; 1 seems adequate to achieve yield
zIndexPopup: 101, // dropdown z-index
	
css: { //look at the end of the code if you want to change css labels},
uiCss: { //look at the end of the code if you want to change ui css labels}
```

You can get a reference to your UFD widget by simply re-selecting the master select again; eg.

```

<select id="demo">
  <option>only 1</option>
</select>

<script type="text/javascript">
  $("#demo").ufd();
  $("#demo").ufd("changeOptions");
  $("#demo").ufd("destroy");
</script>


```

Available commands are currently:

  * changeOptions
  * disable
  * undisable
  * destroy
  * getCurrentTextValue