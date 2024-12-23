function flattenObject(obj, prefix = "") {
    const flattened = {};
  
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;
  
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          // Recursively flatten for nested objects
          Object.assign(flattened, flattenObject(value, newKey));
        } else if (Array.isArray(value)) {
          // Handle arrays by indexing keys
          value.forEach((item, index) => {
            Object.assign(flattened, flattenObject(item, `${newKey}[${index}]`));
          });
        } else {
          // Directly assign primitive values
          flattened[newKey] = value;
        }
      }
    }
  
    return flattened;
  }
  
  // Example usage
  const exampleData = {
    "_class": "hudson.model.FreeStyleBuild",
    "actions": [
      {
        "_class": "hudson.model.CauseAction",
        "causes": [
          {
            "_class": "hudson.model.Cause$UserIdCause",
            "shortDescription": "Started by user Hunter Rocha",
            "userId": "hunter.rocha@costcotravel.com",
            "userName": "Hunter Rocha"
          }
        ]
      },
      {
        "_class": "jenkins.metrics.impl.TimeInQueueAction",
        "blockedDurationMillis": 0,
        "blockedTimeMillis": 0,
        "buildableDurationMillis": 6,
        "buildableTimeMillis": 6,
        "buildingDurationMillis": 987440,
        "executingTimeMillis": 987440,
        "executorUtilization": 1,
        "subTaskCount": 0,
        "waitingDurationMillis": 7619,
        "waitingTimeMillis": 7619
      },
      {
  
      },
      {
  
      },
      {
        "_class": "hudson.plugins.git.util.BuildData",
        "buildsByBranchName": {
          "origin/master": {
            "_class": "hudson.plugins.git.util.Build",
            "buildNumber": 362,
            "buildResult": null,
            "marked": {
              "SHA1": "396d560384eda02fe482339f5786ed17fb10dc8e",
              "branch": [
                {
                  "SHA1": "396d560384eda02fe482339f5786ed17fb10dc8e",
                  "name": "origin/master"
                }
              ]
            },
            "revision": {
              "SHA1": "396d560384eda02fe482339f5786ed17fb10dc8e",
              "branch": [
                {
                  "SHA1": "396d560384eda02fe482339f5786ed17fb10dc8e",
                  "name": "origin/master"
                }
              ]
            }
          },
          "origin/fix-for-delay": {
            "_class": "hudson.plugins.git.util.Build",
            "buildNumber": 53,
            "buildResult": null,
            "marked": {
              "SHA1": "9ed07f2e70dfd5ae0fc17090e95d135a0a8d2f32",
              "branch": [
                {
                  "SHA1": "9ed07f2e70dfd5ae0fc17090e95d135a0a8d2f32",
                  "name": "origin/fix-for-delay"
                }
              ]
            },
            "revision": {
              "SHA1": "9ed07f2e70dfd5ae0fc17090e95d135a0a8d2f32",
              "branch": [
                {
                  "SHA1": "9ed07f2e70dfd5ae0fc17090e95d135a0a8d2f32",
                  "name": "origin/fix-for-delay"
                }
              ]
            }
          }
        },
        "lastBuiltRevision": {
          "SHA1": "396d560384eda02fe482339f5786ed17fb10dc8e",
          "branch": [
            {
              "SHA1": "396d560384eda02fe482339f5786ed17fb10dc8e",
              "name": "origin/master"
            }
          ]
        },
        "remoteUrls": [
          "https://tfs.pacific.costcotravel.com/tfs/TestAutomation/Git_repo/_git/UIAuto_Tests"
        ],
        "scmName": ""
      },
      {
  
      },
      {
        "_class": "hudson.model.ParametersAction",
        "parameters": [
          {
            "_class": "hudson.model.StringParameterValue",
            "name": "Send_Failure_Reports_To",
            "value": "hunter.rocha@costcotravel.com@costcotravel.com"
          },
          {
            "_class": "hudson.model.StringParameterValue",
            "name": "Logging_Service_Run_Id",
            "value": "75073"
          },
          {
            "_class": "hudson.model.StringParameterValue",
            "name": "Run_Name",
            "value": ""
          },
          {
            "_class": "hudson.model.StringParameterValue",
            "name": "Match_All_Tags",
            "value": "regression"
          },
          {
            "_class": "hudson.model.StringParameterValue",
            "name": "Match_Any_One_Tags",
            "value": "shopping_consumer_allInclusive,shopping_consumer_cruise,shopping_consumer_multicity"
          },
          {
            "_class": "hudson.model.BooleanParameterValue",
            "name": "Skip_Slow_Tag_Scan",
            "value": true
          },
          {
            "_class": "hudson.model.StringParameterValue",
            "name": "FeatureFlags_To_Turn_On",
            "value": ""
          },
          {
            "_class": "hudson.model.StringParameterValue",
            "name": "FeatureFlags_To_Turn_Off",
            "value": ""
          },
          {
            "_class": "hudson.model.BooleanParameterValue",
            "name": "Mobile_Mode",
            "value": false
          },
          {
            "_class": "hudson.model.StringParameterValue",
            "name": "Domain_Priority",
            "value": "us,ca"
          },
          {
            "_class": "hudson.model.StringParameterValue",
            "name": "Test_Environment",
            "value": "qaauto"
          },
          {
            "_class": "hudson.model.StringParameterValue",
            "name": "Rerun_Count",
            "value": "1"
          },
          {
            "_class": "hudson.model.StringParameterValue",
            "name": "Log_Level",
            "value": "debug"
          },
          {
            "_class": "hudson.model.StringParameterValue",
            "name": "Test_Feature_Flags",
            "value": ""
          },
          {
            "_class": "hudson.model.BooleanParameterValue",
            "name": "Validate_Test_Reliability",
            "value": false
          },
          {
            "_class": "hudson.model.StringParameterValue",
            "name": "Branch",
            "value": "master"
          },
          {
            "_class": "hudson.model.StringParameterValue",
            "name": "Final_Match_All_Tags",
            "value": ""
          }
        ]
      },
      {
        "_class": "hudson.tasks.junit.TestResultAction",
        "failCount": 116,
        "skipCount": 0,
        "totalCount": 125,
        "urlName": "testReport"
      },
      {
  
      },
      {
  
      },
      {
  
      },
      {
  
      },
      {
        "_class": "org.jenkinsci.plugins.displayurlapi.actions.RunDisplayAction"
      }
    ],
    "artifacts": [
      {
        "displayPath": "failedTests.txt",
        "fileName": "failedTests.txt",
        "relativePath": "target/surefire-reports/failedTests.txt"
      }
    ],
    "building": false,
    "description": null,
    "displayName": "#362",
    "duration": 987440,
    "estimatedDuration": 3875995,
    "executor": null,
    "fullDisplayName": "01_Shopping_UI_CRT_Consumer_Part1 #362",
    "id": "362",
    "inProgress": false,
    "keepLog": false,
    "number": 362,
    "queueId": 3436251,
    "result": "FAILURE",
    "timestamp": 1734992585734,
    "url": "https://jenkins-auto.pacific.costcotravel.com/view/Automation%20Tests/view/Shopping/view/00%20-%20Weekly%20UI%20CRT/job/01_Shopping_UI_CRT_Consumer_Part1/362/",
    "builtOn": "US03L73BAA05",
    "changeSet": {
      "_class": "hudson.plugins.git.GitChangeSetList",
      "items": [],
      "kind": "git"
    },
    "culprits": [
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/swati.gupta",
        "fullName": "Swati Gupta"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/pacific%5Cpeter.yan",
        "fullName": "Peter Yan"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/deepa.patil",
        "fullName": "Deepa Patil"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/chandra.chapala",
        "fullName": "Chandra Chapala"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_r.nanthakumar",
        "fullName": "Rajeshkumar Nanthakumar"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_jiayi.zhou@costcotravel.com",
        "fullName": "Jiayi Zhou"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/nurlan.amirzada",
        "fullName": "Nurlan Amirzada"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_subodh.bhandwalkar",
        "fullName": "Subodh Bhandwalkar"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_k.chinnuswamy",
        "fullName": "Kokilaselvi Chinnuswamy"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_khushbu.verma",
        "fullName": "Khushbu Verma"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/gauri.khaladkar",
        "fullName": "Gauri Khaladkar"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/keiko.ide",
        "fullName": "Keiko Ide"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/sergey.skanchenko",
        "fullName": "Sergey Skanchenko"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/vien.ly",
        "fullName": "Vien Ly"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_pooja.kothale",
        "fullName": "Pooja Kothale"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_jagadesh.kumar",
        "fullName": "c_Jagadesh Kumar"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_suma.babu",
        "fullName": "Suma Babu"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_mukund.rajput",
        "fullName": "Mukund Rajput"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_rajesh.das",
        "fullName": "Rajesh Das"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/ailaiti.aizimaiti",
        "fullName": "Ailaiti.Aizimaiti"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/malini.murthy",
        "fullName": "Malini Murthy"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/sindhu.pambungal",
        "fullName": "Sindhu Pambungal"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/pacific%5Ctad.price",
        "fullName": "Tad Price"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_devang.suthar@costcotravel.com",
        "fullName": "Devang Suthar"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_sumathi.chelladuri",
        "fullName": "Sumathi Chelladuri"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_snehalata.talikoti",
        "fullName": "Snehalata Talikoti"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_prasanthi.mylavarapu",
        "fullName": "c_Prasanthi.Mylavarapu"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/pacific%5Cvanarasi.swamy",
        "fullName": "Vanarasi Swamy"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/vishnu.narasimhan",
        "fullName": "Vishnu Narasimhan"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_pratana.lamwilai",
        "fullName": "Pratana Lamwilai"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/monica.aswani",
        "fullName": "Monica Aswani"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_richard.labrecque",
        "fullName": "Richard Labrecque"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/anh.vu",
        "fullName": "Anh Vu"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_chaitanya.movva",
        "fullName": "c_Chaitanya.Movva"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/smita.mutalikdesai",
        "fullName": "Smita Mutalik-Desai"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_aleksandra.popova",
        "fullName": "Aleksandra Popova"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/serhii.kuzmenko",
        "fullName": "Serhii Kuzmenko"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_harshini.pandiri",
        "fullName": "Harshini Pandiri"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/pacific%5Csergey.skanchenko",
        "fullName": "Sergey Skanchenko"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/tingting.mu",
        "fullName": "Ting Ting Mu"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/hunter.rocha@costcotravel.com",
        "fullName": "Hunter Rocha"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/sravani.thota",
        "fullName": "Sravani Thota"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_nurlan.amirzada",
        "fullName": "c_nurlan.amirzada"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_rohit.kumar",
        "fullName": "Rohit Kumar"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_gunasekaran.e",
        "fullName": "Gunasekaran E"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/ajay.anand",
        "fullName": "Ajay Anand"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_kiran.ghadge",
        "fullName": "Kiran Ghadge"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/archana.ajith",
        "fullName": "Archana Ajith"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/jen.wong",
        "fullName": "Jen Wong"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_k.chandrasekaran",
        "fullName": "Kannappa Chandrasekaran"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/viktoriya.shulga",
        "fullName": "Viktoriya Shulga"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_kamlesh.patil",
        "fullName": "Kamlesh Patil"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/surya.sukumaran",
        "fullName": "Surya Sukumaran"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_kumari.chinnathamb",
        "fullName": "Kumari Chinnathambi"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_sujan.manandhar",
        "fullName": "Sujan Manandhar"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/moulika.parangi",
        "fullName": "Moulika Parangi"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/manasa.bommakanti",
        "fullName": "Manasa Bommakanti"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/shameem.shaik",
        "fullName": "Shameem Shaik"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_gayatri.patil",
        "fullName": "Gayatri Patil"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_saikumar.vadde",
        "fullName": "Saikumar Vadde"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/david.devin",
        "fullName": "David Devin"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/subhashini.balaji",
        "fullName": "Subhashini Balaji"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/wesley.taylor",
        "fullName": "Wesley Taylor"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_m.sankararaman",
        "fullName": "Muthulakshmi Sankararaman"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/vladyslav.prusak",
        "fullName": "Vladyslav Prusak"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_mrudula.sindhu2",
        "fullName": "Mrudula Sindhu"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/niraj.shrestha",
        "fullName": "Niraj Shrestha"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/cole.hamilton",
        "fullName": "Cole Hamilton"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/andrey.naumov",
        "fullName": "Andrey Naumov"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_v.krishnasamy",
        "fullName": "Vadivel Krishnasamy"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/rethi.pillai",
        "fullName": "Rethi Pillai"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_m.thangaraj",
        "fullName": "Mathivanan Thangaraj"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_serhii.kuzmenko",
        "fullName": "Serhii Kuzmenko"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_sornakumar.anbu",
        "fullName": "Sornakumar Anbu"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/kokila.chinnuswamy",
        "fullName": "Kokila Chinnuswamy"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/rachelle.maurer",
        "fullName": "Rachelle Maurer"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_prabakaran.shanmugavelu",
        "fullName": "c_Prabakaran.Shanmugavelu"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/izanna.kutepov",
        "fullName": "Izanna Kutepov"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/viktor.kolesnyk",
        "fullName": "Viktor Kolesnyk"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/132604098+karahaddock",
        "fullName": "132604098+karahaddock"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_mariia.suzdaltceva",
        "fullName": "c_Mariia Suzdaltceva"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_rucha.pande",
        "fullName": "c_Rucha Pande"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_k.martyshchenko",
        "fullName": "Kirill Martyshchenko"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_kishore.bhumadi",
        "fullName": "c_Kishore Bhumadi"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_s.chandrappagari",
        "fullName": "Sunil Chandrappagari"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/c_varri.lakshmi",
        "fullName": "Varri Lakshmi"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/huseyin.turgut",
        "fullName": "Huseyin Turgut"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/tim.cao",
        "fullName": "Tim Cao"
      },
      {
        "absoluteUrl": "https://jenkins-auto.pacific.costcotravel.com/user/fagan.yusifli",
        "fullName": "Fagan Yusifli"
      }
    ]
  }
  
  const flattenedData = flattenObject(exampleData);
  console.log(flattenedData);
  