These are nodeunit tests. install nodeunnit globally and run nodeunit tests/ to test the entire tree
or nodeunit tests/file.js to test a single element.

IMPORTANT USE NOTE: Mongo must be STARTED for the test suite to work.

Note - I discovered recently that I am misusig the setup method - should really be setUp to run multiply.... will fix soon.