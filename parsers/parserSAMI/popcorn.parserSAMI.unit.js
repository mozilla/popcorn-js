var count = 0,
      i = 0,
      sub,
      poppercorn,
      subs = [
        {
          id: 0,
          text: 'SAMI 0000 text',
          target: 'subtitle-container',
          start: 0,
          end: 1
        },
        {
          id: 1,
          text: 'SAMI 1000 text',
          target: 'subtitle-container',
          start: 1,
          end: 2
        },
        {
          id: 2,
          text: 'SAMI 2000 text',
          target: 'subtitle-container',
          start: 2,
          end: 3
        },
        {
          id: 3,
          text: 'SAMI 3000 text',
          target: 'subtitle-container',
          start: 3,
          end: 6
        }
      ],
      expects = subs.length * 5 + 1,
      reset = function () {
        count = i = 0;
        poppercorn = Popcorn('#video');
      };

asyncTest('Popcorn SAMI parser 1.0 Plugin - Matching Tags In Body', function () {
  function plus() {
    if (++count === expects) {
      start();
    }
  }

  reset();
  poppercorn.parseSAMI('data/data.matchingtagsinbody.smi', function () {
    Popcorn.forEach(poppercorn.getTrackEvents(), function (evt) {
      if( evt._natives.type === 'subtitle') {
        sub = subs[i++];

        strictEqual(evt.id, sub.id, 'Correctly parsed id of ' + evt.id);
        plus();
        strictEqual(evt.start, sub.start, 'Correctly parsed start of ' + evt.id + ' at ' + evt.start);
        plus();
        strictEqual(evt.text, sub.text, 'Correctly parsed text of ' + evt.id + ' at ' + evt.start);
        plus();
        strictEqual(evt.target, sub.target, 'Correctly parsed target of ' + evt.id + ' at ' + evt.start);
        plus();
        strictEqual(evt.end, sub.end, 'Correctly parsed end of ' + evt.id + ' at ' + evt.start);
        plus();
      }
    });

    strictEqual(subs.length, i, 'Parsed all subtitles');
    plus();
  });

  expect(expects);
});

asyncTest('Popcorn SAMI parser 1.0 Plugin - No Matching Tags In Body', function () {
  function plus() {
    if (++count === expects) {
      start();
    }
  }

  reset();
  poppercorn.parseSAMI('data/data.nomatchingtagsinbody.smi', function () {
    Popcorn.forEach(poppercorn.getTrackEvents(), function (evt) {
      if( evt._natives.type === 'subtitle') {
        sub = subs[i++];

        strictEqual(evt.id, sub.id, 'Correctly parsed id of ' + evt.id);
        plus();
        strictEqual(evt.start, sub.start, 'Correctly parsed start of ' + evt.id + ' at ' + evt.start);
        plus();
        strictEqual(evt.text, sub.text, 'Correctly parsed text of ' + evt.id + ' at ' + evt.start);
        plus();
        strictEqual(evt.target, sub.target, 'Correctly parsed target of ' + evt.id + ' at ' + evt.start);
        plus();
        strictEqual(evt.end, sub.end, 'Correctly parsed end of ' + evt.id + ' at ' + evt.start);
        plus();
      }
    });

    strictEqual(subs.length, i, 'Parsed all subtitles');
    plus();
  });

  expect(expects);
});
    
asyncTest('Popcorn SAMI parser 1.0 Plugin - Mixed Matching Tags In Body', function () {
  function plus() {
    if (++count === expects) {
      start();
    }
  }

  reset();
  poppercorn.parseSAMI('data/data.mixedmatchingtagsinbody.smi', function () {
    Popcorn.forEach(poppercorn.getTrackEvents(), function (evt) {
      if( evt._natives.type === 'subtitle') {
        sub = subs[i++];

        strictEqual(evt.id, sub.id, 'Correctly parsed id of ' + evt.id);
        plus();
        strictEqual(evt.start, sub.start, 'Correctly parsed start of ' + evt.id + ' at ' + evt.start);
        plus();
        strictEqual(evt.text, sub.text, 'Correctly parsed text of ' + evt.id + ' at ' + evt.start);
        plus();
        strictEqual(evt.target, sub.target, 'Correctly parsed target of ' + evt.id + ' at ' + evt.start);
        plus();
        strictEqual(evt.end, sub.end, 'Correctly parsed end of ' + evt.id + ' at ' + evt.start);
        plus();
      }
    });

    strictEqual(subs.length, i, 'Parsed all subtitles');
    plus();
  });

  expect(expects);
});