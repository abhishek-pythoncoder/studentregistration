export const formatStudentData = (data) => {
    const studentData = {
        id: data["student_id"],
        firstName: data["first_name"],
        lastName: data["last_name"],
        gender: data["gender"],
        medicalCondition: data["medical_condition"],
        dob: data["dob"],
        profile: `${process.env.REACT_APP_ORIGIN}${data["profile_photo"]}`,
        isPrevious: data["is_previous_student"] ? "true" : "false",
        islamicGradePrev: data["islamic_studies_grade_prev_year"],
        iqraGradePrev: data["iqra_grade_prev_year"],
        fatherName: data["father_name"],
        fatherEmail: data["father_email"],
        fatherContact: data["father_contact_number"],
        motherName: data["mother_name"],
        motherEmail: data["mother_email"],
        motherContact: data["mother_contact_number"],
        corresspondence: data["preferred_contact_for_correspondence"],
        corrEmail: data["email_for_correspondence"],
        homeAddress: data["home_address"],
        ambulanceCover: data["ambulance_cover"] ? "true" : "false",
        ambulanceMembershipNumber: data["ambulance_membership_number"],
        refereeName: data["referee_name"],
        refereePhone: data["referee_phone_number"],
        refereeEmail: data["referee_email_address"],
        enrollmentYear: data["enrolment_for_year"],
        fees_paid: data["fess_paid"],
        current_record: data["current_record"],
        status: data["status"],
        active_record: ["active_record"],
        gradeInSchool: data["grade_in_school"],
        currIqraGrade: data["curr_iqra_grade"],
        currIslamicGrade: data["current_islamic_grade"]
      };
return studentData
}
export const reformatSutdentData = (data) => {

}