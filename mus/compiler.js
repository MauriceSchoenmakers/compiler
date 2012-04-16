// extend target object t with properties of s1,s2,..sn
var x=function(t,s1,s2){for(var i=1,l=arguments.length,s;i<l;++i){s=arguments[i];for(var p in s)t[p]=s[p];}return t;};

var compiler=x(M={},{

    error:function(msg,expr){console.log(msg,expr); throw Error(msg+(expr&&expr.tag?': '+expr.tag:''));},

    compile: function F(expr,start){if(!start)start=0;
        switch(expr.tag){
            case 'note'  : expr=x({},expr,{pitch:M.convertPitch(expr.pitch)});
            case 'rest'  : return[x(expr,{start:start})];
            case 'seq'   : return F(expr.left,start).concat(F(expr.right,M.endTime(start,expr.left)));
            case 'par'   : return F(expr.left,start).concat(F(expr.right,start));
            case 'repeat': return 0==expr.count?[]:F(expr.section,start).concat(F((expr.count--,expr),M.endTime(start,expr.section)));
        }
        return M.error('unknown tag:',expr);
    },

    endTime:function F(time,expr) {  // calulate end time on a mus expr based on a given start time
        switch(expr.tag){
            case 'rest':
            case 'note':return time+expr.dur;
            case 'seq' :return time+F(0,expr.left)+F(0,expr.right);
            case 'par' :return time+Math.max(F(0,expr.left),F(0,expr.right));
            case 'repeat': return time+expr.count*F(0,expr.section); // not really needed as done by recursion in compile
        }
        return M.error('unknown tag:',expr);
    },

    convertPitch:x(function F(pitch){
        return 12 + 12 * parseInt(pitch[1],10) + F.letter2pitch[pitch[0]];
    },{letter2pitch:{c:0,d:2,e:4,f:5,g:7,a:9,b:11}}), // now idea where this data comes from?, see http://www.phys.unsw.edu.au/jw/notes.html

    // loop over test set and log results
    test:x(function F(){ for(name in F.set) F.log(name,F.set[name]); },{
        log:function(name,t){console.log('\n\n\n=== TEST:'+name+' ===\n',t,'\n\n--- compile result ---\n', M.compile(t));},

        set:{

            'seq':{ tag: 'seq',
                left: { tag: 'seq',
                    left: { tag: 'note', pitch: 'a4', dur: 250 },
                    right:{ tag: 'note', pitch: 'b4', dur: 250 }
                },
                right: { tag: 'seq',
                    left: { tag: 'note', pitch: 'c4', dur: 500 },
                    right:{ tag: 'note', pitch: 'd4', dur: 500 }
                }
            },

            'par':{ tag: 'par',
                left: { tag: 'note', pitch: 'c4', dur: 250 },
                right:{ tag: 'par',
                    left: { tag: 'note', pitch: 'e4', dur: 250 },
                    right:{ tag: 'note', pitch: 'g4', dur: 250 }
                }
            },

            'rest':{ tag: 'par',
                left: { tag: 'note', pitch: 'c4', dur: 250 },
                right:{ tag: 'seq',
                    left: { tag: 'rest', dur: 100 },
                    right:{ tag: 'note', pitch: 'g4', dur: 250 }
                }
            },

            'repeat':{ tag: 'par',
                left: { tag: 'note', pitch: 'c4', dur: 250 },
                right:{ tag: 'seq',
                    left: { tag: 'rest', dur: 100 },
                    right:{ tag: 'repeat',
                        section: { tag: 'note', pitch: 'g4', dur: 250 },
                        count: 5
                    }
                }
            }
        }
    })
});

compiler.test();
