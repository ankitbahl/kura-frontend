#!/bin/bash
aws s3 sync ./build/ s3://ankit2bahl-website --delete
