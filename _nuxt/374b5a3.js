(window.webpackJsonp=window.webpackJsonp||[]).push([[4],{202:function(t,e,r){"use strict";r.r(e);r(67);var n=r(1).a.extend({mounted:function(){var t=this.$route.hash;if(t){var e=this.parseQuery(t.substring(1));this.$store.commit("SET_TOKEN",e.access_token),e.state?this.$router.push(e.state):this.$router.push("/")}else this.$nuxt.error({statusCode:401,message:"Unauthorized"})},methods:{parseQuery:function(t){for(var e={},r=("?"===t[0]?t.substr(1):t).split("&"),i=0;i<r.length;i++){var n=r[i].split("=");e[decodeURIComponent(n[0])]=decodeURIComponent(n[1]||"")}return e}}}),o=r(30),component=Object(o.a)(n,(function(){var t=this.$createElement;return(this._self._c||t)("div",{staticClass:"wrapper"})}),[],!1,null,null,null);e.default=component.exports}}]);