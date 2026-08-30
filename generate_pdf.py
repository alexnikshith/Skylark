import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def build_pdf():
    pdf_path = "Skylark_Decision_Log.pdf"
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle', 
        parent=styles['Heading1'], 
        fontSize=15, 
        leading=18, 
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=2
    )
    subtitle_style = ParagraphStyle(
        'DocSub', 
        parent=styles['Normal'], 
        fontSize=9, 
        leading=12, 
        textColor=colors.HexColor('#475569'),
        spaceAfter=8
    )
    h2_style = ParagraphStyle(
        'SecH2', 
        parent=styles['Heading2'], 
        fontSize=11, 
        leading=14, 
        textColor=colors.HexColor('#1e40af'), 
        spaceBefore=8, 
        spaceAfter=3
    )
    body_style = ParagraphStyle(
        'Body', 
        parent=styles['Normal'], 
        fontSize=9, 
        leading=12, 
        textColor=colors.HexColor('#334155'), 
        spaceAfter=4
    )

    doc = SimpleDocTemplate(
        pdf_path, 
        pagesize=letter, 
        leftMargin=36, 
        rightMargin=36, 
        topMargin=36, 
        bottomMargin=36
    )
    story = []

    story.append(Paragraph("<b>Skylark Drones - Technical Decision Log</b>", title_style))
    story.append(Paragraph("<b>Assignment:</b> Founder Business Intelligence Agent | <b>Length:</b> 2 Pages Max", subtitle_style))

    story.append(Paragraph("1. Key Assumptions Made", h2_style))
    story.append(Paragraph("<b>a) Energy Sector Taxonomy:</b> Standardized and merged <i>Renewables</i> (111 deals) and <i>Powerline</i> (26 deals) into Energy (Renewables & Power) while maintaining sub-sector drilldown capability.", body_style))
    story.append(Paragraph("<b>b) Financial Imputations & Missing Data:</b> Deals lacking explicit deal value (181 deals) are excluded from sum totals unless estimated. Risk-weighted pipeline is computed via <i>Masked Deal Value x Closure Probability</i>. Incomplete dates fall back gracefully (Actual Close Date -&gt; Tentative Close Date -&gt; Created Date).", body_style))
    story.append(Paragraph("<b>c) Operational Revenue Leakage:</b> Defined as Work Orders with Execution Status = Completed / Partially Completed where Billing Status is not Billed and unbilled balance &gt; 0.", body_style))

    story.append(Paragraph("2. Technical Trade-offs Chosen & Rationale", h2_style))
    
    trade_data = [
        [Paragraph("<b>Decision</b>", body_style), Paragraph("<b>Option Chosen</b>", body_style), Paragraph("<b>Rationale & Trade-off</b>", body_style)],
        [Paragraph("Monday.com Integration", body_style), Paragraph("Hybrid Live GraphQL API + Ingested Dynamic Boards", body_style), Paragraph("Supports live api.monday.com/v2 GraphQL API while enabling 100% immediate testability without requiring evaluator API key.", body_style)],
        [Paragraph("NL BI Architecture", body_style), Paragraph("Intent Classifier + Deterministic Calculation Engine", body_style), Paragraph("Guarantees 100% financial mathematical precision for founder metrics, preventing LLM hallucinations on revenue/receivables.", body_style)],
        [Paragraph("State & Storage", body_style), Paragraph("Client-side Reactive Memory + Dynamic JSON Ingestion", body_style), Paragraph("Reduces latency, guarantees sub-second query responses, and enables zero-dependency hosting.", body_style)]
    ]
    
    t = Table(trade_data, colWidths=[110, 150, 280])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t)

    story.append(Paragraph("3. Interpretation of 'Leadership Updates'", h2_style))
    story.append(Paragraph("Founders spend hours translating raw operational tables into executive slide decks for weekly C-suite syncs. We built a dedicated <b>Leadership Update Generator</b> featuring:", body_style))
    story.append(Paragraph("&bull; <b>Slide Carousel Presentation Mode:</b> Ready-to-present slide deck summarizing revenue, sector focus, and operational risks.<br/>&bull; <b>Actionable Financial Risk Callouts:</b> Instant flagging of unbilled execution balance and stalled high-value deals.<br/>&bull; <b>Multi-Format Exports:</b> 1-click PDF Report Export and copyable Markdown for email/Slack briefings.", body_style))

    story.append(Paragraph("4. What We Would Do Differently With More Time", h2_style))
    story.append(Paragraph("1. <b>Monday.com Real-time Webhooks:</b> Implement webhooks to refresh BI analytics automatically on item changes.<br/>2. <b>Predictive Revenue Forecasting:</b> Build Monte Carlo probabilistic models incorporating historical win rates.<br/>3. <b>Automated Push Alerts:</b> Send Slack/Teams alerts when unbilled execution balance exceeds Rs. 50 Lakhs.", body_style))

    doc.build(story)
    print(f"Successfully generated {pdf_path} ({os.path.getsize(pdf_path)} bytes).")

if __name__ == "__main__":
    build_pdf()
