# Topcat IJP Plugin

A Topcat plugin that enables the configuration and submission of jobs to the ICAT Job Portal on data viewed in Topcat. 

## Configuration

This plugin requires some additional configuration options in **topcat.json** and some additional translation strings in **lang.json**.

### topcat.json

The following configuration options are added within the existing "facilities" attribute in topcat.json

```
  {    
      "facilities": [
          {
              "ijpUrl": "https://example.com"
              "browse":{
                  "dataset": {
                       "enableConfigureJob": true
                  }
                  "datafile": {
                       "enableConfigureJob": true
                  }
              }
          }
      ]
  }
```
the above attributes are defined as: 

  * "facilities"
    * [facility]
      * "ijpUrl" - A URL to a valid IJP REST API.
      * "browse"
        * "dataset"
          * "enableConfigureJob" - specifies whether you are able to configure a job on a single specific dataset via a button in the "Browse" table. Can be true or false.
        * "datafile"
          * "enableConfigureJob" - specifies whether you are able to configure a job on a single specific datafile via a button in the "Browse" table. Can be true or false.

### lang.json

Some of the additional translation strings required for this plugin are included within the existing hierarchy in lang.json and are as follows:

```
{
  "MAIN_NAVIGATION": {
    "MAIN_TAB": {
      "MY_JOBS": "My Jobs"
    }
  },
  "CART": {
    "CONFIGURE_JOB_BUTTON" : {
      "TEXT" : "Configure Job",
      "TOOLTIP" : {
        "TEXT" : "Click to configure and run a job on the cart items"
      }
    },
    "CONFIGURE_JOB_MULTI_FACILITY_BUTTON" : {
      "TEXT" : "Configure Job ({{facilityTitle}})",
      "TOOLTIP" : {
        "TEXT" : "Click to configure and run a job on the cart items for this facility"
      }
    }
  }
}

```
The rest of the translation strings can be appended to the lang.json file and are as follows:

```
{
  "MY_JOBS" : {
    "TITLE" : "My Jobs",
    "NO_RESULTS" : "You do not have any jobs",
    "LOADING" : "Loading - please wait",
    "NO_IJP" : "There is no ICAT Job Portal defined for this facility",
    "COLUMN": {
      "JOB_ID": "Job Id",
      "NAME": "Job Type",
      "DATE": "Submitted",
      "STATUS": "Status",
      "ACTIONS": {
        "NAME": "Actions",
        "BUTTON" : {
          "DELETE_JOB" : {
            "TEXT" : "Delete Job",
            "TOOLTIP" : {
              "TEXT": "This will permanently delete this job"
            }
          },
          "CANCEL_JOB" : {
            "TEXT" : "Cancel Job",
            "TOOLTIP" : {
              "TEXT": "This will cancel this job, it cannot be restarted"
            }
          }
        }
      }
    },
    "BUTTON" : {
      "CONFIGURE_JOB" : {
        "TEXT" : "Configure New Job"
      },
      "CONFIGURE_JOB_DROPDOWN" : {
        "TEXT" : "Configure New Job ",
        "TOOLTIP" : {
          "TEXT" : "Click to configure a job for a certain facility"
        }
      }
    },
    "JOB_DETAILS" : {
      "MODAL" : {
        "TITLE" : "Job Details For Job {{jobId}}",
        "IS_LOADING": "Loading standard output...",
        "NO_OUTPUT": "There is no standard output for this job",
        "TABS" : {
          "STANDARD_OUTPUT": "Standard Output",
          "ERROR_OUTPUT": "Error Output"
        },
        "BUTTON" : {
          "CLOSE" : {
            "TEXT" : "Close"
          }
        }
      }
    },
    "CHOOSE_JOB_INPUTS" : {
      "MODAL" : {
        "TITLE" : "Choose Job Inputs",
        "INPUT_CHOICE_MESSAGE" : "You have {{numCartItems}} items in your cart, do you want to run a job on these items or run a job with no inputs?",
        "BUTTON" : {
          "CLOSE" : {
            "TEXT" : "Close"
          },
          "CART_INPUT" : {
            "TEXT" : "Run Job On Cart Items"
          },
          "NO_INPUT" : {
            "TEXT" : "Run Job With No Inputs"
          }
        }
      }
    }
  },
  "CONFIGURE_JOB" : {
    "MODAL" : {
      "TITLE" : "Configure Job",
      "SINGLE_JOB_TYPE" : {
        "TITLE" : "Job Type: {{jobName}}"
      },
      "JOB_TYPES_LOADING_MESSAGE" : "Loading compatible job types...",
      "NO_JOB_TYPES_MESSAGE" : "There are no job types compatible with this input",
      "NO_JOB_OPTIONS_MESSAGE" : "There are no configuration options for this job type",
      "ERROR" : {
        "REQUIRED" : "This field is required",
        "INTEGER" : "This field must be an integer",
        "FLOAT" : "This field must be a number",
        "MAX" : "This field must be between {{min}} and {{max}}",
        "MIN" : "This field must be between {{min}} and {{max}}"
      },
      "SELECT_LABEL" : {
        "JOB_TYPE" : "Job Type"
      },
      "BUTTON" : {
        "SUBMIT_JOB" : {
          "TEXT" : "Submit Job"
        },
        "SUBMIT_MULTIPLE_JOBS" : {
          "TEXT" : "Submit Multiple Jobs",
          "TOOLTIP" : {
            "TEXT" : "NOTE: This will submit {{numJobs}} jobs, one for each cart item. "
          }
        },
        "CLOSE" : {
            "TEXT" : "Back"
        }
      }
    }
  },
  "CONFIRM_JOB" : {
    "MODAL" : {
      "TITLE" : "Confirm Submission",
      "JOBS_CHOICE_MESSAGE" : "Please select whether you would like to submit a single job for all cart items or {{numJobs}} separate jobs (one for each cart item).",
      "BUTTON" : {
        "SUBMIT_MULTIPLE_JOBS" : {
          "TEXT" : "Submit Multiple Jobs"
        },
        "SUBMIT_SINGLE_JOB" :  {
          "TEXT" : "Submit Single Job"
        },
        "CLOSE" : {
          "TEXT" : "Cancel"
        }
      }
    }
  },
  "SUBMITTING_JOB" : {
    "MODAL" : {
      "TITLE" : "Job Submission",
      "SUBMITTING_JOB_MESSAGE" : "Submitting - please wait...",
      "BATCH_SUBMISSION_SUCCESSFUL_MESSAGE" : "Job submitted successfully with job ID {{jobId}}",
      "BATCH_SUBMISSIONS_SUCCESSFUL_MESSAGE" : "Jobs submitted successfully with job IDs {{jobIds}}",
      "WIN_INTERACTIVE_SUBMISSION_SUCCESSFUL_MESSAGE" : "Interactive job submitted successfully. A .rdp file should download, open it in Remote Desktop and enter the password below. If no file is downloaded, please start Remote Desktop and manually enter the following values:",
      "UNIX_INTERACTIVE_SUBMISSION_SUCCESSFUL_MESSAGE" : "Interactive job submitted successfully. Please paste the following into a terminal:",
      "SUBMISSION_FAILED_MESSAGE" : "One or more job submissions failed: ",
      "COLUMN" : {
        "INPUT_ENTITY_IDS" : "Input Entity Ids",
        "ERROR_MESSAGE" : "Error response"
      },
      "BUTTON" : {
        "CLOSE" : {
          "TEXT" : "Back"
        }
      }
    }
  },
  "CONFIGURE_JOB_ENTITY_ACTION_BUTTON": {
    "TEXT": "Configure Job",
    "TOOLTIP": {
      "TEXT": "Click to configure a job on this entity"
    }
  }
}

```