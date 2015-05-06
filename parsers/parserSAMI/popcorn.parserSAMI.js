// PARSER: SAMI 1.0
(function (Popcorn) {
  /**
   * SAMI popcorn parser plug-in
   * Parses subtitle files in the SAMI format.
   *
   * @param {Object} data
   *
   */
  Popcorn.parser('parseSAMI', function (data) {
    var subtitles = {
            title: '',
            remote: '',
            data: []
          },
          _data,
          _maxDisplayTime = 3;

    if (!data.text) {
        return subtitles;
    }

    _data = data.text.replace(/body/gi, 'BODY')
            .replace(/<sync/gi, '<SYNC')
            .replace(/start=/gi, 'START=')
            .replace(/<p/gi, '<P')
            .replace(/<\/p>/gi, '</P>')
            .replace(/<\/sync>/gi, '</SYNC>');

    _data = _data.substring(6 + _data.indexOf('<BODY>'), _data.indexOf('</BODY>'));

    var nextStartPosition = _data.indexOf('START='),
          nextEndPosition = -1,
          nextLineStartPosition = -1,
          nextEndPPosition = -1,
          nextEndSyncPosition = -1,
          nextStartSyncPosition = - 1,
          startTime;
    while (-1 !== nextStartPosition) {
      nextStartPosition += 6;
      nextEndPosition = _data.indexOf('>', nextStartPosition);
      startTime = (_data.substring(nextStartPosition, nextEndPosition).replace(/"/g, '')) / 1000;
      
      nextStartPosition = _data.indexOf('>', _data.indexOf('<P', nextEndPosition)) + 1;
      nextEndPPosition = _data.indexOf('</P>', nextStartPosition);
      nextEndSyncPosition = _data.indexOf('</SYNC>', nextStartPosition);
      nextStartSyncPosition = _data.indexOf('<SYNC', nextStartPosition);
      nextLineStartPosition = _data.indexOf('<P', nextStartPosition);
      
      nextEndPosition = Math.min(-1 === nextEndPPosition ? Number.MAX_VALUE : nextEndPPosition,
                          Math.min(-1 === nextEndSyncPosition ? Number.MAX_VALUE : nextEndSyncPosition,
                            Math.min(-1 === nextStartSyncPosition ? Number.MAX_VALUE : nextStartSyncPosition, _data.length)));

      if (-1 !== nextLineStartPosition && nextEndPosition > nextLineStartPosition) {
        // More data lines before nextEndPosition - those will be discarded
        nextEndPosition = nextLineStartPosition;
      }

      subtitles.data.push({
        subtitle: {
          id: subtitles.data.length,
          text: (_data.substring(nextStartPosition, nextEndPosition) || '').replace(/(style([^>]+)"|<div([^>]+)>|<\/div>|(\r\n|\n|\r)|^[.\s]+|[.\s]+$)/gi, ''),
          start: startTime,
          end: null
        }
      });

      nextStartPosition = _data.indexOf('START=', nextEndPosition);
    }
    
    for(var i = 0; subtitles.data.length > i; i++){
        subtitles.data[i].subtitle.end = subtitles.data[i].subtitle.start + ((subtitles.data.length - 1 === i)
                                            ? _maxDisplayTime
                                            : (_maxDisplayTime >= subtitles.data[1 + i].subtitle.start - subtitles.data[i].subtitle.start)
                                              ? subtitles.data[1 + i].subtitle.start - subtitles.data[i].subtitle.start
                                              : _maxDisplayTime);
    }
    
    return subtitles;
  });
})(Popcorn);