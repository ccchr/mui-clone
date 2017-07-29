/*!
 * Monogram
 * Copyright (c) 2017 Monogram, LLC All rights reserved.
 * --------------------------------------------------------
 * Made by Monogram. http://monogram.design/
 */
$(function(){$(document).on("click","a.scroller",function(e){e.preventDefault();var t=$(this).attr("href");TweenLite.to(window,1.5,{scrollTo:t,ease:Power3.easeInOut})})});