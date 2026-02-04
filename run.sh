#!/usr/bin/env bash

set -e

export PATH="$HOME/.gem/ruby/3.3.0/bin:/opt/rubies/ruby-3.3.0/bin:$PATH"

env RACK_ENV=production rackup -p 9294
