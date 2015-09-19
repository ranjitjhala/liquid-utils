# Liquid Utilities

This package has some common code for extracting type- and error- information
from the output of liquid-types based tools, including:

+ [LiquidHaskell][1]
+ [RefScript][2]

This can be used to implement back-ends, e.g. for [Atom](http://atom.io) or
for the [web-demo][3], from which this code is mostly extracted.

[1]: https://github.com/ucsd-progsys/liquidhaskell
[2]: https://github.com/ucsd-progsys/refscript
[3]: https://github.com/ucsd-progsys/liquid-server


## TODO

1. Define a type for LiquidInfo
2. export parseInfo(f:FilePath): Promise<LiquidInfo>
3. export liquidInfoProvider(file, line, col): Info -- as in hover.d.ts 
4. export liquidErrorProvider(file): Array<Error>
