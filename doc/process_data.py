import pandas as pd

prof_df = pd.read_csv('raw_data/professors.csv')
gpa_df = pd.read_csv('raw_data/uiuc-gpa-dataset.csv')

def normalize_name(name):
    if pd.isna(name) or not isinstance(name, str):
        return ''
    parts = [p.strip() for p in name.split(',')]
    last = parts[0]
    first = parts[1].split()[0] if len(parts) > 1 else ''
    return f"{last}, {first}"

prof_df['Name_norm'] = prof_df['Name'].apply(normalize_name)
gpa_df['Instructor_norm'] = gpa_df['Primary Instructor'].apply(normalize_name)

prof_df = prof_df[prof_df['Name_norm'] != '']
gpa_df = gpa_df[gpa_df['Instructor_norm'] != '']

gpa_df['CourseID'] = gpa_df['Subject'].astype(str) + gpa_df['Number'].astype(str)

prof_courses = gpa_df[['Instructor_norm', 'CourseID']]
prof_courses = prof_courses.drop_duplicates().rename(columns={'Instructor_norm': 'Name_norm', 'CourseID': 'Course'})

left = prof_df[['Name_norm','Rating','Difficulty','Would-Take-Again','Link']]

profdata = left.merge(prof_courses, on='Name_norm', how='inner')
profdata = profdata.rename(columns={'Name_norm':'Name'})
profdata = profdata[['Name','Course','Rating','Difficulty','Would-Take-Again','Link']]
profdata.to_csv('profdata.csv', index=False)

grade_cols = ['A+','A','A-','B+','B','B-','C+','C','C-','D+','D','D-','F','W','Students']
gpa_df[grade_cols] = gpa_df[grade_cols].apply(pd.to_numeric, errors='coerce').fillna(0)

advancedgpa = gpa_df.groupby('CourseID')[grade_cols].sum().reset_index()
advancedgpa.to_csv('advancedgpa.csv', index=False)

grade_points = {'A+':4.0,'A':4.0,'A-':3.6,'B+':3.3,'B':3.0,'B-':2.7,'C+':2.3,'C':2.0,'C-':1.7,'D+':1.3,'D':1.0,'D-':0.7,'F':0.0}
num = advancedgpa[list(grade_points)].mul(pd.Series(grade_points), axis=1).sum(axis=1)
den = advancedgpa[list(grade_points)].sum(axis=1)
gpadata = pd.DataFrame({'CourseID':advancedgpa['CourseID'],'Students':advancedgpa['Students'],'GPA':(num/den).round(2)})
gpadata.to_csv('gpadata.csv', index=False)

print("Done: profdata.csv, advancedgpa.csv, gpadata.csv generated")
