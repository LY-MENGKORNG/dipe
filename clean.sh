#!/usr/bin/env bash

# node_modules
# rm -rf ./node_modules apps/*/node_modules packages/*/node_modules

# cache
rm -rf .turbo apps/*/{.turbo,dist} packages/*/{.turbo,dist}
