#!/bin/bash

# Read each line in the .env file
while IFS= read -r line || [[ -n "$line" ]]; do
  # Skip comments and empty lines
  if [[ "$line" =~ ^\ *# || -z "$line" ]]; then
    continue
  fi

  # Split the line into key and value
  IFS='=' read -r key value <<< "$line"

  # Run eb setenv for each key-value pair
  eb setenv "$key=$value"

done < .env