/*!
 * Douban Movie Top250 JavaScript
 * sandmanman@qq.com
 * 2016.05.14 23:44
 */

var $ = require('jquery');
var template = require('components/artTemplate/artTemplate');
require('components/bootstrap/modal');

(function() {
    'use strict';

    var Util = (function() {
        var perfix = 'h5_';
        // localStorage getItem
        var storageGetter = function(key) {
            return localStorage.getItem(perfix + key);
        };
        // localStorage setItem
        var storageSetter = function(key, val) {
            return localStorage.setItem(perfix + key, val);
        };

        // var getJsonp = function(url, callback){
        // 	// 使用jquery.jsonp.js
        // 	return $.jsonp({
        // 		url: url,
        // 		cache: true,
        // 		callback: 'duokan_fiction_chapter', // callback为项目约定的callback
        // 		success: function(result) {
        // 			//debugger
        // 			var data = $.base64.decode(result); // 使用jquery.base64.js解密
        // 			var json = decodeURIComponent(escape(data)); // 解码
        // 			callback(json);
        // 		}
        // 	});
        // };

        return {
            //GetJsonp: getJsonp,
            storageGetter: storageGetter,
            storageSetter: storageSetter
        };
    })();

    // dom节点缓存
    var dom_node = {
        movie_list_wrap: $('#movieListWrap'),
        load_more: $('#js-loadMore'),
        detail_modal: $('#js-movieDetailModal')
    };

    // 定义loading
    var loadingelement = '<div class="loading"><span class="cinefilm-loader"><span class="turntable"></span><span class="turntable"></span><span class="text">影片加载中...</span></span></div>';

    var movie_model;

    function main() {
        // 入口函数
        movie_model = movieModel();
        movie_model.getMovieContent();
        eventHanlder();
    }

    function movieModel() {
        // todo 获取数据

        var start_num;
        var id_movie;

        // 一页面20,从0开始
        // start=0,是第一页.start=240最后一页
        // total=250,排行显示的数字应该是length+1
        if (!start_num) {
            start_num = 0;
        }

        // 获取电影列表
        var getMovieContent = function(start_num) {
            // todo 获取top250数据

            $.ajax({
                type: 'GET',
                url: 'https://api.douban.com//v2/movie/top250?start=' + start_num,
                dataType: 'jsonp',
                jsonp: 'callback',
                beforeSend: function() {
                    dom_node.movie_list_wrap.after(loadingelement);
                },
                success: function(data) {
                    // 获取数据后做什么
                    var source = __inline('../tpl/dm_top250/_dm_card.tmpl');
                    var render = template.compile(source); // artTemplate.js
                    var list_html = render(data);

                    $('.loading').remove();

                    dom_node.movie_list_wrap.append(list_html);
                    dom_node.load_more.show();

                    dom_node.detail_modal.find('.modal-body').html('');

                    // 点击查看详细
                    $('.movie-card').each(function(){
                      $(this).click(function(){
                        id_movie = $(this).data('id');
                        //console.log(id_movie);
                        dom_node.detail_modal.find('.modal-body').html(loadingelement);
                        dom_node.detail_modal.modal();
                        dom_node.detail_modal.on('shown.bs.modal', function(){
                          getMovieDetail(id_movie);
                        });
                      });
                    });

                    // if (callback) {
                    // 	callback();
                    // } // 等同于callback && callback();

                },
                error: function(xhr) {
                    if (xhr.status == '404') {
                        console.log('请求不存在。');
                    }
                    if ( xhr.status == '500' ) {
                      alert('好像出了点问题，稍后再试试吧。');
                    }
                }
            });
        };


        // 加载更多
        var loadMore = function() {
            start_num = parseInt(start_num);

            if (start_num === 240) {
                alert('没有更多了！');
                return;
            }
            start_num += 20;

            getMovieContent(start_num);
        };


        var getMovieDetail = function(id_movie) {
            // todo 获取某部影片的详细
            $.ajax({
              type: 'GET',
              url: 'https://api.douban.com/v2/movie/subject/' + id_movie,
              dataType: 'jsonp',
              jsonp: 'callback',
              // beforeSend: function() {
              //     dom_node.detail_modal.find('.modal-body').html(loadingelement);
              // },
              success: function(data) {
                  var source = __inline('../tpl/dm_top250/_dm_detail_card.tmpl');
                  var render = template.compile(source);
                  var detail_html = render(data);

                  dom_node.detail_modal.find('.loading').remove();
                  dom_node.detail_modal.find('.modal-body').html(detail_html);
              },
              error: function(xhr) {
                if ( xhr.status == 404 ) {
                  alert('请求地址不存在');
                }
              }
            });
        };


        return {
            getMovieContent: getMovieContent,
            loadMore: loadMore,
            getMovieDetail: getMovieDetail
        };

    }


    function eventHanlder() {
        // todo 绑定交互事件

        // 点击执行加载更多
        $('#js-loadMoreBtn').on('click', function() {
            dom_node.load_more.hide();
            movie_model.loadMore();
        });

    }

    // 调用入口函数执行
    main();

})();
