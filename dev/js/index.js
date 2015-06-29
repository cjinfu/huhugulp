(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';


(function($) {


    var client = require('./common/client.js'),
        report = require('./common/report.js'),
        share = require('./common/share.js');


    window.G = {};
    G.noSupport = false;
    G.gc = powder.getQueryValue('gc');
    //平台判断
    if (/MicroMessenger/i.test(navigator.userAgent)) {
        G.media = 'wx';
    } else if (/Qzone/i.test(navigator.userAgent)) {
        G.media = 'qzone';
    } else if (mqq.QQVersion != "0") {
        G.media = 'qq';
    } else {
        G.media = 'other';
    }
    if (powder.getQueryValue('source')) {
        G.reportMedia = powder.getQueryValue('source');
    } else {
        G.reportMedia = 'qqaid';
    }
    if (G.media !== 'qq' && !powder.getQueryValue('qq')) {
        $('#OpenByQQ').show();
        $('#layout').hide();
        G.noSupport = true;
        client.launchUriInQQ(location.href);
    }
    G.newH = function(w, h, newW) {
        return h * newW / w;
    };
    if(!G.noSupport){
        //full style
        //console.log('ClientWidth:'+powder.wClientWidth())
        if (powder.wClientWidth() < 375) {
            $('body').addClass('minWidth');
        } else if (powder.wClientWidth() > 375) {
            $('body').addClass('maxWidth');
        }
        //pageMap
        if (pageMap == 'index') {
            //自适应
            $('#banner').height(G.newH(1242, 1066, powder.wClientWidth()));
            $('#con1').height(G.newH(1242, 406, powder.wClientWidth()));
            $('#con2').height(G.newH(1242, 390, powder.wClientWidth()));
            $('#con3').height(G.newH(1242, 459, powder.wClientWidth()));
            if(mqq.iOS){
                $('#con1').addClass('con1-ios');
            }else{
                $('#con1').addClass('con1');
            }
            report.tdw(
                ['opername', 'module', 'action', 'ver1'], ['orange_local', 'give_reward', 'exp', G.reportMedia]
            );
        } else if (pageMap == 'cancel') {
            //自适应
            $('#encourage').height(G.newH(1014, 304, $('#encourage').width()));
            $('#cancel-con1').height(G.newH(1242, 658, powder.wClientWidth()));
            $('#cancel-con2').height(G.newH(1242, 388, powder.wClientWidth()));
            $('#cancel-con3').height(G.newH(1242, 552, powder.wClientWidth()));
            $('#ornament').height(G.newH(1242, 1340, powder.wClientWidth()));
            if(mqq.iOS){
                $('#cancel-con1').addClass('cancel-con1-ios');
            }else{
                $('#cancel-con1').addClass('cancel-con1');
            }
            //立即去群里唠嗑
            if (mqq.compare("5.5") > -1 || powder.getQueryValue('qq')) {
                $('#callQun').pTouch({
                    tap: function() {
                        client.callQun(G.gc);
                        report.tdw(
                            ['opername', 'module', 'action'], ['orange_local', 'cancle_reward', 'Clk_button']
                        );
                    },
                    beforeActiveClass: 'active'
                });
            } else {
                $('#callQun').hide();
            }
            report.tdw(
                ['opername', 'module', 'action', 'ver1'], ['orange_local', 'cancle_reward', 'exp', G.reportMedia]
            );
        }
        if(!G.noSupport){
            //设置qq客户端顶部背景色
            mqq.ui.setWebViewBehavior({
                navBgColor: 0xff9b30,
                navTextColor: 0xffffff,
                actionButton: 1
            });
        }
        //群名称
        $('#qunName').html(decodeURIComponent(powder.getQueryValue('name')));

        //右上角分享按钮设置
        if (G.media === 'qq') { //qq
            mqq.ui.setActionButton({
                iconID: 4
            }, function() {
                if (pageMap == 'index') {
                    report.tdw(
                        ['opername', 'module', 'action'], ['orange_local', 'give_reward', 'Clk_share']
                    );
                } else if (pageMap == 'cancel') {
                    report.tdw(
                        ['opername', 'module', 'action'], ['orange_local', 'cancle_reward', 'Clk_share']
                    );
                }
                share.qq();
            });
        } else if (G.media === 'wx') {
            share.wx();
        }





        //banner定点
        var percent = powder.wClientWidth() / 1242;
        var left = 328 * percent,
            top = 718 * percent,
            width = 602 * percent,
            height = 104 * percent;
        $('#qunNameBox').css({
            top: top,
            height: height,
            lineHeight: height + 'px'
        });


        $(window).load(function(){
            window.timeOnLoad = new Date().getTime();
            if (pageMap == 'index') {
                report.h(1539,1,1,[1,2,3,4],
                    [
                    timeCssEnd-timeDomStart,
                    timeDomReady-timeDomStart,
                    timeOnLoad-timeDomStart,
                    timeDomReady-timeJsStart]
                );
            } else if (pageMap == 'cancel') {
                report.h(1539,1,2,[1,2,3,4],
                    [
                    timeCssEnd-timeDomStart,
                    timeDomReady-timeDomStart,
                    timeOnLoad-timeDomStart,
                    timeDomReady-timeJsStart]
                );
            }
            
        });
        

    }



})(Zepto);
},{"./common/client.js":2,"./common/report.js":3,"./common/share.js":4}],2:[function(require,module,exports){
'use strict';
module.exports = (function() {
    return {
        uin: function() {
            //return powder.cookie("uin").replace(/[^\d]/g,"");
            //return powder.cookie("uin").replace("o0","");
            var uin = (document.cookie.match(/\W*uin=o(\d+)/) || [])[1];
            if (uin) {
                uin = uin.replace(/^[\D0]+/g, '');
            } else {
                uin = 0;
            }
            return uin;
        },
        bkn: function() {
            function getToken() {
                var skey = powder.cookie('skey');
                if(skey===null){
                    return;
                }
                var hash = 5381;
                for (var i = 0, len = skey.length; i < len; ++i) {
                    hash += (hash << 5) + skey.charCodeAt(i);
                }
                var _token = hash & 0x7fffffff;
                return _token;
            }
            return getToken();
        },
        //呼起QQ客户端
        //呼起后要调用的uri地址
        launchUriInQQ: function(uri, failCallback) {
            var f = document.createElement("iframe");
            f.style.display = "none";
            document.body.appendChild(f);
            var isSuccess = false;
            f.onload = function() {
                isSuccess = true;
            };
            f.src = 'mqqapi://forward/url?src_type=web&version=1&url_prefix=' + btoa(uri);
            setTimeout(function(){
                if(!isSuccess){
                    f.src = 'mqqapi://forward/url?src_type=web&version=1&t=1&url_prefix=' + btoa(uri);
                }
            },500);
            //f.src = 'mqqapi://forward/url?src_type=web&version=1&url_prefix=' + btoa(uri);
            // console.log(uri);
            // console.log('mqqapi://forward/url?src_type=web&version=1&url_prefix=' + btoa(uri));

        },
        //呼起手Q客户端群资料卡
        callQun: function(uin) {
            if(mqq.iOS){
                mqq.invoke("nav", "openGroupAioOrProfile", {"uin" : uin});
            }else if(mqq.android){
                //mqq.invoke("im", "aioorprofile", {"uin" : uin});
                var f = document.createElement("iframe");
                f.style.display = "none";
                document.body.appendChild(f);
                f.src = 'mqqapi://im/aioorprofile?src_type=internal&version=2&uin='+uin+'&jump_from=h5';
            }
        }
    };
})();
},{}],3:[function(require,module,exports){
'use strict';

var report = {};
module.exports = report;

window.G = window.G || {};
window.G.report = report;

var APPID = {
    badjs: 283,
    mm: 1000215,
    tdw: 'dc00141'
};

var UIN = (document.cookie.match(/\W*uin=o(\d+)/) || [])[1];
if (UIN) {
    UIN = UIN.replace(/^[\D0]+/g, '');
} else {
    UIN = 0;
}

var GCODE = (window.location.search.match(/[?&]gc=(\d+)[^?&]?/) || [])[1] || G.gc;


var type = function(o) {
    var t = Object.prototype.toString.call(o),
        l = t.length;
    return o == null ? String(o) : t.slice(8, l - 1);
};

var arrayIndexOf = function(arrData, oKey) {
    for (var i = 0, len = arrData.length; i < len; i++) {
        if (arrData[i] == oKey) {
            return true;
        }
    }
    return false;
};

//罗盘上报
// report.tdw(
//     ['opername','module','action'],
//     [opername,module,action]
// );
report.tdw = function(fields, data) {
    if (type(data) != 'Array') {
        console.log('The param "data" required and must be an array.');
    };

    // 保证data是二维数组
    if (type(data[0]) != 'Array') data = [data];

    // 此处统一填群号
    if (GCODE && !arrayIndexOf(fields, 'obj1')) {
        fields.unshift('obj1');
        data[0].unshift(G.gc);
    }
    // 此处统一添加qq版本号
    if (!arrayIndexOf(fields, 'obj2')) {
        fields.unshift('obj2');
        if (typeof mqq == 'undefined') {
            data[0].unshift(navigator.userAgent);
        } else {
            data[0].unshift(mqq.QQVersion);
        }
    }
    // 此处统一添加uin
    if (UIN && !arrayIndexOf(fields, 'uin')) {
        fields.unshift('uin');
        data[0].unshift(UIN);
    }
    // 加时间戳，确保不会被缓存
    // 实践发现fields不能encodeURIComponent
    var url = 'http://cgi.connect.qq.com/report/tdw/report?table=' + APPID.tdw + '&fields=' + JSON.stringify(fields) + '&datas=' + encodeURIComponent(JSON.stringify(data)) + '&t=' + Date.now();
    var img = new Image();
    img.src = url;
    img = null;
};

//monitor 上报
//report.m(232334);
//report.m([2323,445,5643]);
report.m = function(id) {
    var url = 'http://cgi.connect.qq.com/report/report_vm?monitors=[' + id + ']&t=' + Date.now();
    var img = new Image();
    img.src = url;
    img = null;
};

//huatuo上报
//report.h(223,5334,6676,[1,2,5,7],[2223,4423,664,77]);
report.h = function(f1, f2, f3, fields, data) {
    var str = '';
    fields.forEach(function(item, i) {
        str += item + '=' + data[i] + '&';
    });
    var speedparams = encodeURIComponent('flag1=' + f1 + '&flag2=' + f2 + '&flag3=' + f3 + '&' + str);
    var url = 'http://report.huatuo.qq.com/report.cgi?appid=10016&speedparams='+speedparams;
    var img = new Image();
    img.src = url;
    img = null;
};
},{}],4:[function(require,module,exports){
'use strict';
var report = require('./report.js');

module.exports = (function() {
    var _share={
        init:function(title){
            //分享文案
            G.share = G.share || {};
            G.share.url=G.share.url || location.href;
            if(pageMap == 'index'){
                G.share.title=G.share.title || '我的群荣获橙名尊享，速来膜拜！',
                G.share.desc=G.share.desc || '《'+decodeURIComponent(powder.getQueryValue('name'))+'》上周表现优秀，荣获橙名尊享！';
                G.share.img=G.share.img || '___cdn/img/index/share.png?___md5';
            }else if(pageMap == 'cancel'){
                G.share.title=G.share.title || '我的群被取消橙名尊享，加把劲下周赢回来！',
                G.share.desc=G.share.desc || '《'+decodeURIComponent(powder.getQueryValue('name'))+'》上周表现欠佳，被取消橙名尊享！';
                G.share.img=G.share.img || '___cdn/img/cancel/share.png?___md5';
            }
        },
        qq:function(){
            var shareQQBox = $("#share-qq"),
                shareQQ = shareQQBox.find('[data-share]'),
                shareQQCancel = shareQQBox.find('[data-cancel]');
            shareQQBox.show();
            setTimeout(function(){
                shareQQ.addClass('show');
            },20);
            //注册事件
            if(!window.shareQQFlag){
                window.shareQQFlag=true;
                //取消按钮
                shareQQCancel.pTouch({tap:function(){
                    shareQQ.removeClass('show');
                    setTimeout(function(){
                        shareQQBox.hide();
                    },200);
                }});
                //每一个分享按钮
                $("#share-qq").pTouch({noScroll:true,tap:function(){
                    shareQQ.removeClass('show');
                    setTimeout(function(){
                        shareQQBox.hide();
                    },200);
                }});
                shareQQBox.pTouch('[data-index]',{tap:function(){
                    var self=this;
                    //上报逻辑
                    var m='';
                    switch($(self).data('index')){
                        case '1':
                        case 1:
                            m='qzone';
                            break;
                        case '2':
                        case 2:
                            m='wx';
                            m='weixin';
                            break;
                        case '3':
                        case 3:
                            m='pyq';
                            m='circle';
                            break;
                        case '0':
                        case 0:
                            m='qq';
                            break;
                    }
                    if(pageMap == 'index'){
                        report.tdw(
                            ['opername','module','action','ver1'],
                            ['orange_local','give_reward','Clk_sns',m]
                        );
                    }else if(pageMap == 'cancel'){
                        report.tdw(
                            ['opername','module','action','ver1'],
                            ['orange_local','cancle_reward','Clk_sns',m]
                        );
                    }
                    G.share.url = powder.setQueryValue('source',m,G.share.url);
                    mqq.ui.shareMessage({
                        title: G.share.title,
                        desc: G.share.desc,
                        share_type: $(self).data("index"),
                        share_url: G.share.url,
                        image_url: G.share.img,
                        back: true
                    },function(result){
                        if(result.retCode == 0){
                            mqq.ui.showTips({
                                text: '已发送'
                            });
                        }
                    });
                    
                }});
            }
        },
        wx:function(){
            document.addEventListener('WeixinJSBridgeReady', function() {
                //WeixinJSBridge.invoke('hideToolbar', function(res) {});

                // 发送给朋友
                WeixinJSBridge.on("menu:share:appmessage", shareFriends);

                // 发送到朋友圈分享
                WeixinJSBridge.on("menu:share:timeline", shareTimeline);
            });
            window.shareData = {
                img_url: G.share.img,
                img_width: "300",
                img_height: "300",
                link: G.share.url,
                desc: G.share.desc,
                title: G.share.title
            };
            function shareFriends() {
                WeixinJSBridge && WeixinJSBridge.invoke("sendAppMessage", window.shareData, function(b) {
                    // G.report.tdw(
                    //     ['opername','module','action','ver1'],
                    //     ['Grp_gohome','share','Clksns','wx']
                    // );
                })
            }

            function shareTimeline() {
                WeixinJSBridge && WeixinJSBridge.invoke("shareTimeline", window.shareData, function(b) {
                    // G.report.tdw(
                    //     ['opername','module','action','ver1'],
                    //     ['Grp_gohome','share','Clksns','pyq']
                    // );
                })
            }
        }
    };
    return {
        qq:function(){
            _share.init();
            _share.qq();
        },
        wx:function(){
            _share.init();
            _share.wx();
            // var shareWX = $("#share-wx-box");
            // shareWX.show();
            // //tap事件绑定
            // if(!window.shareWXFlag){
            //     window.shareWXFlag=true;
            //     shareWX.pTouch({noScroll:true,tap:function(){
            //         shareWX.hide();
            //     }});
            // }
        },
        openmobile:function(){
            _share.init();
            //定向分享Api
            //http://tapd.oa.com/QQConnectMobile/wikis/view/H5%2525E5%2525AE%25259A%2525E5%252590%252591%2525E5%252588%252586%2525E4%2525BA%2525ABweb%2525E9%2525A1%2525B5%2525E9%25259D%2525A2%2525E6%25258E%2525A5%2525E5%252585%2525A5wiki
            var url=G.share.url;
            var img=encodeURIComponent(G.share.img);
            
            //client.launchUriInQQ('http://openmobile.qq.com/api/check?page=shareindex.html&style=9&status_os=0&sdkp=0&title='+G.share.title+'&summary='+G.share.desc+'&imageUrl='+img+'&targetUrl='+url+'&page_url='+url+'&pagetitle='+encodeURIComponent('回家的路QQ群与你同行'));
            location.href='http://openmobile.qq.com/api/check?page=shareindex.html&style=9&status_os=0&sdkp=0&title='+G.share.title+'&summary='+G.share.desc+'&imageUrl='+img+'&targetUrl='+url+'&page_url='+url+'&pagetitle='+encodeURIComponent(G.share.desc)+'&appid=101051061';
        }//,
        // share:function(){
        //     _share.init();
        //     var shareWX = $("#share-wx-box");
        //     //显示分享弹层
        //     if(G.media === 'qq'){
        //         _share.qq();
        //     }else if(G.media === 'qzone'){
        //         shareWX.show();
        //     }else if(G.media === 'wx'){
        //         shareWX.show();
        //     }else{
        //         //定向分享Api
        //         //http://tapd.oa.com/QQConnectMobile/wikis/view/H5%2525E5%2525AE%25259A%2525E5%252590%252591%2525E5%252588%252586%2525E4%2525BA%2525ABweb%2525E9%2525A1%2525B5%2525E9%25259D%2525A2%2525E6%25258E%2525A5%2525E5%252585%2525A5wiki
        //         var url=G.share.url;
        //         var img=encodeURIComponent(G.share.img);
                
        //         //client.launchUriInQQ('http://openmobile.qq.com/api/check?page=shareindex.html&style=9&status_os=0&sdkp=0&title='+G.share.title+'&summary='+G.share.desc+'&imageUrl='+img+'&targetUrl='+url+'&page_url='+url+'&pagetitle='+encodeURIComponent('回家的路QQ群与你同行'));
        //         location.href='http://openmobile.qq.com/api/check?page=shareindex.html&style=9&status_os=0&sdkp=0&title='+G.share.title+'&summary='+G.share.desc+'&imageUrl='+img+'&targetUrl='+url+'&page_url='+url+'&pagetitle='+encodeURIComponent(G.share.desc)+'&appid=101051061';
        //     }
        //     //微信模式
        //     if(!window.shareWXFlag){
        //         window.shareWXFlag=true;
        //         shareWX.pTouch({noScroll:true,tap:function(){
        //             shareWX.hide();
        //         }});
        //     }
            
        // }
    };
})();
},{"./report.js":3}]},{},[1]);
