#!/bin/sh

# Exit script in case of error
set -e

if [ ! -z "${S3_ACCESS_KEY}" ]; then
    rclone sync -v --config /rclone.s3.conf /spcwaterproof-geodatadir/ spcwaterproof:geodatadir/
    rclone sync -v --config /rclone.s3.conf /spcwaterproof-media/ spcwaterproof:media/
    rclone sync -v --config /rclone.s3.conf /spcwaterproof-pgdumps/ spcwaterproof:pgdumps/

    echo "S3 sync successful !!"
fi

echo "Finished syncing"
