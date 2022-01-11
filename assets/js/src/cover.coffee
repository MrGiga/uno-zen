'use strict'

$ ->

  _animate = ->
    setTimeout(->
      $('.cover').addClass 'animated'
    , 1000)

  _expand = (options)->
    $('main, .cover, .links > li, html').toggleClass 'expanded'
    Uno.search.form options.form

  $('#menu-button').click ->
    $('.cover, main, #menu-button, html').toggleClass 'expanded'

#If nav is collapsed then on any page load, it should also be collapsed
  $(window).on "load", ->
    if(localStorage.getItem('navcollapsed') == 'true' && $('.cover').hasClass('expanded'))
      $('.cover, main, #menu-button, html, nav-current').toggleClass 'expanded'

#Implemented nav menu collapsing if element.href == window.location.href 
  $('.nav-current').click (event) ->
    element = event.target
    if element.href == window.location.href
      event.preventDefault()
      $('.cover, main, #menu-button, html, nav-current').toggleClass 'expanded'
      localStorage.setItem('navcollapsed',!$('.cover, main, #menu-button, html, nav-current').hasClass('expanded'));
      

  $("#{window.open_button}, #avatar-link").click (event) ->
    if Uno.is 'page', 'home'
      event.preventDefault()
      location.hash = if location.hash is '' then '#open' else ''
      return $('#menu-button').trigger 'click' unless Uno.is 'device', 'desktop'
      _expand form: 'toggle'

  if (Uno.is 'device', 'desktop') and (Uno.is 'page', 'home')
    _animate()
    _expand form: 'hide' unless location.hash is '#open'
