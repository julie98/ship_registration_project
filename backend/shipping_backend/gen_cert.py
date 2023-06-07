from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

personal_vessel_choices = (
        (1, 'barge'),
        (2, 'dinghy'),
        (3, 'hovercraft'),
        (4, 'inflatable'),
        (5, 'motor sailer'),
        (6, 'motor yacht'),
        (7, 'narrow boat'),
        (8, 'sailing yacht'),
        (9, 'sports yacht'),
        (10, 'wet bike')
    )

port_choices = (
        (1, 'Whitby Harbour'),
        (2, 'Point Newcastle'),
        (3, 'Robin Hood\'s Bay'),
        (4, 'Victoria'),
    )

def gen_reg_certificate(vessel, email):
    doc_name = email + "_certificate.pdf"
    doc = SimpleDocTemplate(doc_name, pagesize=letter,
                        rightMargin=72,leftMargin=72,
                        topMargin=72,bottomMargin=18)

    Story=[]
    logo = "shipping_backend/NavisAlbumEnsign.png"

    vessel_part = 'Vessel Particulars: '
    owner_part = 'Owner Particulars: '
    title_text = 'CERTIFICATE OF NAVIS ALBUM REGISTRY'
    act = 'UK Shipping Act of 1995'

    name = 'Name: ' + vessel.get("ship_name")
    port = 'Port: ' + port_choices[vessel.get("port")][1]
    vessel_type = 'Type: ' + personal_vessel_choices[vessel.get("personal_vessel_type")][1]
    model = 'Model: ' + vessel.get("personal_model")
    length = 'Length: ' + str(vessel.get("length"))
    hin = 'Hull Identification Number: ' + vessel.get("hull_id")
    num_hull = 'Number of Hulls: ' + str(vessel.get("num_hull"))

    owners = ""

    for owner in vessel.get("joint_owners"):
        owners += 'Name: ' + owner[0] + '\n'
    
    header_text = '<font size="16">%s</font>'
    standard_text = '<font size="12">%s</font>'
    
    styles=getSampleStyleSheet()
    styles.add(ParagraphStyle(name='Justify_C', alignment=TA_CENTER))

    first_header = header_text % title_text

    Story.append(Paragraph(first_header, styles["Justify_C"]))
    Story.append(Spacer(2, 12))

    im = Image(logo, 2*inch, 1*inch)

    main_header = header_text % act

    tbl_data = [
    [im, Paragraph(main_header, styles["Normal"])]]
    tbl = Table(tbl_data)
    
    tbl.setStyle(TableStyle([('ALIGN',(0, 1), (0, 1),'LEFT'),
        ('VALIGN', (-1, 0), (-1, 0),'MIDDLE'),])
    )

    Story.append(tbl)
    Story.append(Spacer(1, 12))

    second_header = header_text % vessel_part

    Story.append(Paragraph(second_header, styles["Normal"]))
    Story.append(Spacer(2, 12))

    name = standard_text % name

    Story.append(Paragraph(name, styles["Normal"]))
    Story.append(Spacer(.5, 12))

    port = standard_text % port

    Story.append(Paragraph(port, styles["Normal"]))
    Story.append(Spacer(.5, 12))

    vessel_type = standard_text % vessel_type

    Story.append(Paragraph(vessel_type, styles["Normal"]))
    Story.append(Spacer(.5, 12))

    model = standard_text % model

    Story.append(Paragraph(model, styles["Normal"]))
    Story.append(Spacer(.5, 12))

    length = standard_text % length

    Story.append(Paragraph(length, styles["Normal"]))
    Story.append(Spacer(.5, 12))
    
    
    hin = standard_text % hin

    Story.append(Paragraph(hin, styles["Normal"]))
    Story.append(Spacer(.5, 12))


    num_hull = standard_text % num_hull

    Story.append(Paragraph(num_hull, styles["Normal"]))
    Story.append(Spacer(.5, 12))
    
    
    # New Page
    Story.append(PageBreak())

    third_header = header_text % owner_part

    Story.append(Paragraph(third_header, styles["Normal"]))
    Story.append(Spacer(2, 12))

    owners = standard_text % owners

    Story.append(Paragraph(owners, styles["Normal"]))
    Story.append(Spacer(.5, 12))
    
    doc.build(Story)

    return doc_name
