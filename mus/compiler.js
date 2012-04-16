
var test1={ tag: 'seq',
    left:
    { tag: 'seq',
        left: { tag: 'note', pitch: 'a4', dur: 250 },
        right: { tag: 'note', pitch: 'b4', dur: 250 } },
    right:
    { tag: 'seq',
        left: { tag: 'note', pitch: 'c4', dur: 500 },
        right: { tag: 'note', pitch: 'd4', dur: 500 } } };

var test2={ tag: 'par',
    left: { tag: 'note', pitch: 'c4', dur: 250 },
    right:
    { tag: 'par',
        left: { tag: 'note', pitch: 'e4', dur: 250 },
        right: { tag: 'note', pitch: 'g4', dur: 250 } } };


var endTime = function F(time, expr) {
    switch(expr.tag){
        case 'note':return time+expr.dur;
        case 'seq' :return time+F(0,expr.left)+F(0,expr.right);
        case 'par' :
            return time+Math.max(F(0,expr.left),F(0,expr.right));
    }
    throw Error('unknown tag type:'+expr.tag);
};

var compile = function F(musexpr,start){
    if(!start)start=0;
    switch(musexpr.tag){
        case 'note': musexpr.start=start;return[musexpr];
        case 'seq' : return F(musexpr.left,start).concat(F(musexpr.right,endTime(start,musexpr.left)));
        case 'par' : return F(musexpr.left,start).concat(F(musexpr.right,start));
    }
    throw Error('unknown tag type:'+expr.tag);
};


console.log(compile(test1));
console.log(compile(test2));
