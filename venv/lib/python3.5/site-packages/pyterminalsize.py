import collections
import os
import subprocess

import _pyterminalsize

_sources = ('environment', 'stdin', 'stdout', 'stderr', 'tput', 'fallback')
SizeSource = collections.namedtuple('SizeSource', _sources)(*_sources)
Size = collections.namedtuple('Size', ('columns', 'lines', 'source'))


def _from_tput():
    # tput doesn't respond when stderr is piped.
    # But, if we don't have TERM, tput will spew:
    # $ env -i tput cols
    # tput: No value for $TERM and no -T specified
    if not os.environ.get('TERM'):
        raise OSError('Cannot determine cols / lines without TERM')
    proc = subprocess.Popen(
        ('tput', '-S'), stdout=subprocess.PIPE, stdin=subprocess.PIPE,
    )
    output = proc.communicate(b'cols\nlines\n')[0]
    if proc.returncode:
        raise OSError('tput returned ' + str(proc.returncode))
    columns, lines = map(int, output.splitlines())
    return columns, lines


def get_terminal_size(fallback=(80, 24)):
    # First try from the environment (I'm not even sure if this is possible?)
    try:
        return Size(
            int(os.environ['COLUMNS']), int(os.environ['LINES']),
            SizeSource.environment,
        )
    except (ValueError, KeyError):
        pass

    # Then try from file descriptors
    for fd, source in (
            (0, SizeSource.stdin),
            (1, SizeSource.stdout),
            (2, SizeSource.stderr),
    ):
        try:
            return Size(*(_pyterminalsize.get_terminal_size(fd) + (source,)))
        except OSError:
            pass

    # Then try from tput (this makes cygwin work)
    try:
        return Size(*(_from_tput() + (SizeSource.tput,)))
    except OSError:
        pass

    return Size(*(fallback + (SizeSource.fallback,)))
