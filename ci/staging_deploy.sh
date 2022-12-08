#!/bin/sh
# This should be executed on staging machine

PROJECT_ROOT=$(readlink -f $(dirname $0)/..)
PROTOCOL_DIR=$PROJECT_ROOT/protocol
SESSION_NAME=creatures_staging

cd $PROJECT_ROOT
WANT_RESET=0
git remote update
if git status -uno | grep -q behind; then
    WANT_RESET=1
fi

RUNNING_PID=$(tmux ls -f session-name=$SESSION_NAME -F '#{pid}')
if [ "$RUNNING_PID" != "" ]; then
    if [ $WANT_RESET -eq 1 ]; then
        tmux send-keys -t ${SESSION_NAME}.0 C-c
        while [ "$RUNNING_PID" != "" ]; do
            sleep 1
            RUNNING_PID=$(tmux ls -f session-name=$SESSION_NAME -F '#{pid}')
        done
        git pull
    else
        exit 0
    fi
fi

tmux new-session -d -c $PROTOCOL_DIR -s $SESSION_NAME \
     'clarinet integrate -c'
sleep 25s
cd examples/faucet
node topup.js
cd ../admin
node set-operator.js ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5
