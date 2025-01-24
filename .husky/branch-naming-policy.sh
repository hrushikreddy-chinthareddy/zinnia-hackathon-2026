#!/usr/bin/env bash

# Normalize the locale to C
LC_ALL=C

# This file validates the branch name format
# and enforces a naming convention
# using the following regular expression:
# ^(build|ci|docs|feat|fix|perf|refactor|test|bugfix)\/[[:alnum:]-]+-[[:digit:]]+--[[:alnum:]-]+[^-]$
#
# in-depth explanation of the regex below:
# https://regex101.com/r/9EnvqJ/4

# Colors for output
# Regular Colors
BLACK='\033[0;30m'  # Black
RED='\033[0;31m'    # Red
GREEN='\033[0;32m'  # Green
YELLOW='\033[0;33m' # Yellow
BLUE='\033[0;34m'   # Blue
PURPLE='\033[0;35m' # Purple
CYAN='\033[0;36m'   # Cyan
WHITE='\033[0;37m'  # White

# Bold
BBLACK='\033[1;30m'  # Black
BRED='\033[1;31m'    # Red
BGREEN='\033[1;32m'  # Green
BYELLOW='\033[1;33m' # Yellow
BBLUE='\033[1;34m'   # Blue
BPURPLE='\033[1;35m' # Purple
BCYAN='\033[1;36m'   # Cyan
BWHITE='\033[1;37m'  # White
# Reset
NC='\033[0m' # Text Reset

# let's build up this regex in pieces

#  check if branch name starts with a valid branch type
# https://github.com/zinnia/bloom/blob/main/src/docs/decisions/0006-conventional-commit-standard.md?plain=1
# > Type
# > Must be one of the following:
# > build: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
# > ci: Changes to our CI configuration files and scripts (examples: CircleCi, SauceLabs)
# > docs: Documentation only changes
# > feat: A new feature
# > fix: A bug fix
# > perf: A code change that improves performance
# > refactor: A code change that neither fixes a bug nor adds a feature
# > test: Adding missing tests or correcting existing tests
BRANCH_TYPE_PATTERN="^(build|ci|docs|feat|fix|perf|refactor|test|bugfix)"

#  next we look for a valid ticket number
# EX: [CUI-613] [DEPU-2749] [OA5946-5]
TICKET_NUMBER_PATTERN="[[:alnum:]-]+-[[:digit:]]+"

#  next we look for a valid ticket description
# which must be kebab-case
#  and start with a double dash '--'
TICKET_DESCRIPTION_PATTERN="--[[:alnum:]-]+[^-]$"
# ex: [--short-kebab-case-description]

# ticket number and ticket description must be separated by a double dash '--'
# this will help automation distinguish between the two
BRANCH_NAME_PATTERN="$TICKET_NUMBER_PATTERN$TICKET_DESCRIPTION_PATTERN"

# branch type and branch name must be separated by a slash '/'
# this will help semver find the next version number
VALID_BRANCH_REGEX="$BRANCH_TYPE_PATTERN\/$TICKET_NUMBER_PATTERN$TICKET_DESCRIPTION_PATTERN"
# EX: feat/CUI-613--enfoce-branch-naming-convention
# EX: fix/DEPU-2749--short-kebab-case-description

# Get the current branch without the remotes prefix
LOCAL_BRANCH="$(git rev-parse --abbrev-ref HEAD)"

if [[ $LOCAL_BRANCH =~ $VALID_BRANCH_REGEX ]]; then
  echo -e "${CYAN}$VALID_BRANCH_REGEX${NC}"
  exit 0
fi

echo -e "
There was an issue with your branch name: ${CYAN}$LOCAL_BRANCH${NC}

Branch names must adhere to the contract at
${GREEN}https://github.com/zinnia/bloom/blob/main/src/docs/decisions/0006-conventional-commit-standard.md?plain=1${NC}
"

echo "--------------------------------------

The following issues were found:
"

# if the branch name doesn't start with a valid branch type
if [[ ! $LOCAL_BRANCH =~ $BRANCH_TYPE_PATTERN ]]; then
  echo -e "The ${RED}branch type${NC} seems to be missing.
Branch ${YELLOW}type${NC} must be one of the following: ${CYAN}$BRANCH_TYPE_PATTERN${NC}

  > ${GREEN}build${NC}: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
  > ${GREEN}ci${NC}: Changes to our CI configuration files and scripts (examples: CircleCi, SauceLabs)
  > ${GREEN}docs${NC}: Documentation only changes
  > ${GREEN}feat${NC}: A new feature
  > ${GREEN}fix${NC}: A bug fix
  > ${GREEN}perf${NC}: A code change that improves performance
  > ${GREEN}refactor${NC}: A code change that neither fixes a bug nor adds a feature
  > ${GREEN}test${NC}: Adding missing tests or correcting existing tests
  "

fi

# if we cannot find a ticket number
if [[ ! $LOCAL_BRANCH =~ $TICKET_NUMBER_PATTERN ]]; then
  echo -e "The ${RED}ticket number${NC} seems to be missing."
  echo -e "${YELLOW}Ticket numbers${NC} must adhere to the following pattern: ${CYAN}$TICKET_NUMBER_PATTERN${NC}"
  echo -e "For example: ${GREEN}CUI-613${NC}, ${GREEN}DEPU-2749${NC}, or ${GREEN}OA5946-5${NC}

"
fi

#  if the branch name doesn't end with a valid ticket description
if [[ ! $LOCAL_BRANCH =~ '--' ]]; then
  echo -e "Ticket numbers and descriptions must be ${YELLOW}separated by a double dash '--'${NC} to adhere to the following pattern: ${CYAN}$BRANCH_NAME_PATTERN${NC}"
  echo -e "ex: ${GREEN}CUI-613--enfoce-branch-naming-convention${NC} or ${GREEN}DEPU-2749--short-kebab-case-description${NC}

  "
elif [[ ! $LOCAL_BRANCH =~ $TICKET_DESCRIPTION_PATTERN ]]; then
  echo -e "The ${RED}ticket description${NC} seems to be missing."
  echo -e "Ticket ${YELLOW}descriptions${NC} must be kebab-case to adhere to the following pattern: ${CYAN}$TICKET_DESCRIPTION_PATTERN${NC}"
  echo -e "For example: ${GREEN}--enforce-branch-naming-convention${NC}, or ${GREEN}--short-kebab-case-description${NC}

"
fi

# If it finds a ticket number,
# and a ticket description,
# but the branch name still doesn't match the pattern
# we can assume the issue is the `--` double dash separating the number and description
if [[ $LOCAL_BRANCH =~ $TICKET_NUMBER_PATTERN &&
  $LOCAL_BRANCH =~ $TICKET_DESCRIPTION_PATTERN &&
  ! $LOCAL_BRANCH =~ $BRANCH_NAME_PATTERN ]]; then
  echo -e "Ticket numbers and descriptions must be ${YELLOW}separated by a double dash '--'${NC} to adhere to the following pattern: ${CYAN}$BRANCH_NAME_PATTERN${NC}"
  echo -e "ex: ${GREEN}CUI-613--enfoce-branch-naming-convention${NC} or ${GREEN}DEPU-2749--short-kebab-case-description${NC}

"
fi

# If we find a valid branch type,
# and the description is also valid
# the problem MUST be the `/` slash
# separating the type and description
if [[ $LOCAL_BRANCH =~ $BRANCH_TYPE_PATTERN && $LOCAL_BRANCH =~ $BRANCH_NAME_PATTERN && ! $LOCAL_BRANCH =~ $VALID_BRANCH_REGEX ]]; then
  echo -e "Branch type and branch name must be ${YELLOW}separated by a slash '/'${NC} to adhere to the following pattern: ${CYAN}$VALID_BRANCH_REGEX${NC}

"
  echo -e "
  ex: ${GREEN}feat/CUI-613--enfoce-branch-naming-convention${NC} or ${GREEN}fix/DEPU-2749--short-kebab-case-description${NC}
"
fi

echo -e "
--------------------------------------

${CYAN}Please rename your branch to a valid name and try again.${NC}
"

exit 1
