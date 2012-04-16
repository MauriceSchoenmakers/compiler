// extend target object t with properties of s1,s2,..sn
var x=function(t,s1,s2){for(var i=1,l=arguments.length,s;i<l;++i){s=arguments[i];for(var p in s)t[p]=s[p];}return t;};

var compiler=x(M={},{

    compile: function F(expr,start){if(!start)start=0;
        switch(expr.tag){
            case 'note'  : expr=x({},expr,{pitch:M.convertPitch(expr.pitch)});
            case 'rest'  : return[x(expr,{start:start})];
            case 'seq'   : return F(expr.left,start).concat(F(expr.right,start+M.duration(expr.left)));
            case 'par'   : return F(expr.left,start).concat(F(expr.right,start));
            case 'repeat': return 0==expr.count?[]:F(expr.section,start).concat(F((expr.count--,expr),start+M.duration(expr.section)));
        }
        return M.error('unknown tag',expr);
    },

    duration:x(function F(expr){ if(!expr.dur) expr.dur=F.calculate(expr,F); return expr.dur;}, // memorize result in expr
    {calculate:function FF(expr,F){FF=F||FF; // you can also call M.duration.calculate(expr)
        switch(expr.tag){
            case 'note'  :
            case 'rest'  :return expr.dur;
            case 'seq'   :return FF(expr.left)+FF(expr.right);
            case 'par'   :return Math.max(FF(expr.left),FF(expr.right));
            case 'repeat':return expr.count*FF(expr.section); // not really needed as done by recursion in compile
        }
        return M.error('unknown tag',expr);
    }}),

    convertPitch:x(function F(pitch){
        return 12 + 12 * parseInt(pitch[1],10) + F.letter2pitch[pitch[0]];
    },{letter2pitch:{c:0,d:2,e:4,f:5,g:7,a:9,b:11}}), // now idea where this data comes from?, see http://www.phys.unsw.edu.au/jw/notes.html

    error:function(msg,expr){throw x(new Error(msg+(expr&&expr.tag?': '+expr.tag:'')),{expression:expr});},

    // loop over test set and log results
    test:x(function F(){ for(name in F.set) F.exec(name,F.set[name]);},{
        exec:function F(name,t){
            if(F.silent) try{M.compile(t);}catch(e){}
            else try{ console.log('\n\n\n=== TEST:'+name+' ===\n',t,'\n\n--- compile result ---\n');console.log(M.compile(t));}catch(e){console.log("Exception:",e);}
        },

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
            },

            'error':{ tag : 'murks'
            }
        }
    })
});

compiler.test();

console.log('\n\n### benchmark duration(expr) ################################');

var Benchmark=require('benchmark');

var duration_memorize=new Benchmark(function(){compiler.duration(compiler.test.set.seq);});
duration_memorize.run();

var duration_calculate=new Benchmark(function(){compiler.duration.calculate(compiler.test.set.seq);});
duration_calculate.run();

var compare=duration_calculate.compare(duration_memorize);
console.log('duration_calculate', (0>compare?'is slower then':(0<compare?'is faster then':'is a fast as')),'duration_memorize');
