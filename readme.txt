--Readme document for JERUSHA PALA, jpala@uci.edu, 31366004-- 

1. How many assignment points do you believe you completed (replace the *'s with your numbers)?

9.5/10
- 1/1 The ability to log overnight sleep
- 1/1 The ability to log sleepiness during the day
- 1/1 The ability to view these two categories of logged data
- 2/2 Either using a native device resource or backing up logged data
- 1.5/2 Following good principles of mobile design
- 2/2 Creating a compelling app
- 1/1 A readme and demo video which explains how these features were implemented and their design rationale

2. How long, in hours, did it take you to complete this assignment?
Probably close to 16 hours. 


3. What online resources did you consult when completing this assignment? (list specific URLs)
- Lecture code demo
- https://ionicframework.com/docs/components
- https://ionicframework.com/docs/api/datetime
- https://ionicframework.com/docs/api/chip
- https://ionicframework.com/docs/api/segment
- https://ionicframework.com/docs/api/accordion
- https://ionicframework.com/docs/theming/dark-mode

4. What classmates or other individuals did you consult as part of this assignment? What did you discuss?
N/A


5. Is there anything special we need to know in order to run your code?
Nope. 

--Aim for no more than two sentences for each of the following questions.--


6. Did you design your app with a particular type of user in mind? If so, whom?
I was thinking about college students who tend to have irregular sleep 
schedules. And it's a good way for them to see how their sleep affects 
how they feel during the day. 


7. Did you design your app specifically for iOS or Android, or both?
I designed it for iOS (I tested my app in the view of an iPhone SE). 


8. How can a person log overnight sleep in your app? Why did you choose to support logging overnight sleep in this way?
I chose to have people log their full night in the morning. Log defaults to the last night's date, 
11PM bedtime, and 7AM waketime to make it quicker to log & prevent mistakes. It also prevents errors 
with error messages. 
    ==> "Log Overnight Sleep" ; edit date+times ; optional sleep quality rating (1-5) ; 
        optional notes ; "Log" 


9. How can a person log sleepiness during the day in your app? Why did you choose to support logging sleepiness in this way?
To make logging quicker, the log's time defaults to the current time, and the user only 
has to tap a number on the scale (1-7) and optionally add notes. I also show a list
of today's earlier logs to help them compare how they feel now with earlier in the day. 
    ==> "Log Sleepiness" ; edit time ; sleepiness rating (1-7) ; optional notes ; "Log" 


10. How can a person view the data they logged in your app? Why did you choose to support viewing logged data in this way?
I have 2 tabs so the 2 kinds of data don't get mixed together. Each row shows just 
the date/time & the most important number (sleep duration or sleepiness rating), so 
the person can scan the data and have a clear, non-cluttered view. You can click on a log 
to expand it to see more details, or to edit or delete it. 


11. Which feature choose--using a native device resource, backing up logged data, or both?
Backing up logged data (Option 2)


12. If you used a native device resource, what feature did you add? How does this feature change the app's experience for a user?
N/A


13. If you backed up logged data, where does it back up to?
The logs save locally to the user's device using Ionic Storage, which keeps them 
in the browser's IndexedDB. 


14. How does your app implement or follow principles of good mobile design?
I have 3 main actions on the homescreen as large buttons. I try to 
prevent user mistakes by using pickers & chips for dates+times (instead of typing) 
and by giving error messages for impossible entries. I also have the "uh-oh" 
escapes (editing or discarding a log) and I use Ionic's standard iOS components
like the back button, date/time pickers. 