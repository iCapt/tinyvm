# tinyvm

A tiny stack virtual machine for make.fun's "Build a tiny stack virtual machine" bounty.

Run: `MAKEFUN_INPUT_DIR=<input> MAKEFUN_OUTPUT_DIR=<output> node main.ts`

It runs each `/input/<id>/program.bin` with `/input/<id>/input.bin` and writes
`/output/<id>/stdout.bin` and `/output/<id>/exit.txt`, per the ISA in the kit.

Bounty: https://make.fun/bounty/tiny-stack-vm-01-run-20261122
