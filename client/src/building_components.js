import React from 'react'

import {
    platform,
    getRandomColorWithSV,
    array_shift_entry,
    Container,
    SubContainer,
    SmoothAddContainer,
    ShrinkContainer,
    SplitContainer,
    Section,
    SubSection,
    InputText,
    InputColor,
    InputNumber,
    Button,
    RearrangeButton,
    HistoGraph,
    DraggableItem
} from './esomos_ui_kit/index.js'

import "./building_components.css"

class LogSubject extends React.Component {
    render() {
        return (
            <SmoothAddContainer delete={false}>
                <Section>
                    <SubSection>
                        <InputText
                            value={this.props.subject.name}
                            onChange={(event) => {
                                this.props.onChange({
                                    name: event.target.value,
                                    index: this.props.index
                                })
                            }}
                        />

                        <InputColor
                            value={this.props.subject.color}
                            onChange={(event) => {
                                this.props.onChange({
                                    color: event.target.value,
                                    index: this.props.index
                                })
                            }} />

                    </SubSection>
                    <SubSection>
                        <InputNumber
                            label='present'
                            value={this.props.subject.present}
                            sef={this.present_field_ref}
                            onChange={(event) => this.props.onChange({
                                present: Number(event.target.value),
                                index: this.props.index
                            })}
                        />
                        <InputNumber
                            label='from total'
                            value={this.props.subject.total}
                            sef={this.total_field_ref}
                            onChange={(event) => this.props.onChange({
                                total: Number(event.target.value),
                                index: this.props.index
                            })}
                        />
                    </SubSection>
                    <SubSection>
                        <Button onClick={() => {
                            this.props.onChange({
                                present: this.props.subject.present - 1,
                                total: this.props.subject.total - 1,
                                index: this.props.index
                            })
                        }}>-</Button>
                        <Button onClick={() => {
                            this.props.onChange({
                                present: this.props.subject.present + 1,
                                total: this.props.subject.total + 1,
                                index: this.props.index
                            })
                        }}>+</Button>
                    </SubSection>
                    {(platform === 'pc') ? null :
                    <SubSection>
                        <RearrangeButton onRearrange={this.props.onRearrange} />
                    </SubSection>}
                    <SubSection>
                        {(platform === 'phone') ? null :
                        <Button sef={this.props.drag_button_ref} style={{ cursor: 'grab' }}>
                            🖐🏻
                        </Button>}
                        <Button
                            tooltip="booho"
                            onClick={() => { this.props.onCross(this.props.index) }}
                        >
                            ✖
                        </Button>
                    </SubSection>
                </Section>
            </SmoothAddContainer>
        )
    }
}

export class AttendanceLog extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            log: props.log,
            key: 0
        }
        this.subject_refs = {}
    }

    key_gen() {
        const log = this.state.log
        return log.key_count++
    }

    handle_subject_change(event) {
        const subject = this.state.log.subjects[event.index]
        const bar = this.state.log.graph[event.index]

        if (event.total !== undefined) {
            subject.total = event.total
            bar.height = event.total
            bar.plots[0].percentage = Math.round((subject.present / event.total) * 100)
        }
        if (event.present !== undefined) {
            subject.present = event.present
            bar.plots[0].percentage = Math.round((event.present / subject.total) * 100)
        }
        if (event.name !== undefined) {
            subject.name = event.name
            bar.name = (event.name === '') ? '(nameless)' : event.name
        }
        if (event.color) {
            subject.color = event.color
            bar.plots[0].color = event.color
        }
        this.setState({ log: this.state.log })
    }
    handle_subject_cross(index) {
        this.state.log.subjects.splice(index, 1)
        this.state.log.graph.splice(index, 1)
        this.setState({ log: this.state.log })
    }

    handle_log_change(event) {
        const log = this.state.log
        log.name = event.target.value
        this.setState({ log: log })
    }

    render_subjects(log, disable_button, style) {
        const add_subject = (p_at) => {
            const random_color = getRandomColorWithSV(0.8, 0.9)
            const new_key = this.key_gen()
            const new_subject = {
                name: 'name',
                present: 50,
                total: 100,
                color: random_color,
                key: new_key,
            }
            const new_bar = {
                name: 'name',
                color: 'rgb(0, 0, 0, 0.2)',
                height: 100,
                plots: [
                    {
                        name: '',
                        color: random_color,
                        percentage: 50
                    }
                ],
                key: new_key
            }
            if (p_at) {
                log.subjects.splice(p_at, 0, new_subject)
                log.graph.splice(p_at, 0, new_bar)
            }
            else {
                log.subjects.unshift(new_subject)
                log.graph.unshift(new_bar)
            }
            this.setState({ log: log })
        }
        return (
            <SubContainer>
                <ShrinkContainer
                    show_sign="Show Subjects"
                    hide_sign="Hide Subjects"
                    className="log-subject-container"
                    style={style}
                    disable_button={disable_button ? disable_button : undefined}
                >
                    <Section>
                        <Button style={{ width: '100%' }} onClick={() => add_subject(0)}>+</Button>
                    </Section>
                    {!log.subjects.length ? 'add a subject!' :
                        log.subjects.map((value, i) => {
                            const subject_ref = this.subject_refs[value.key] ? this.subject_refs[value.key] : React.createRef()
                            this.subject_refs[value.key] = subject_ref
                            return (
                                <DraggableItem
                                    className='log-subject-sub-container'
                                    key={value.key}
                                    index={i}
                                    drag_ref={subject_ref}
                                    item_type={`SUBJECT-${log.key}`}
                                    item_key={value.key}
                                    drop_hover={(item) => {
                                        if (item.item_key !== value.key) {
                                            array_shift_entry(log.subjects, item.index, i)
                                            array_shift_entry(log.graph, item.index, i)
                                            item.index = i
                                            this.setState({ log: log })
                                        }
                                    }}
                                >
                                    <LogSubject
                                        subject={value}
                                        drag_button_ref={subject_ref}
                                        index={i}
                                        is_last={i === log.subjects.length - 1}
                                        onRearrange={(direction) => {
                                            array_shift_entry(log.subjects, i, i + direction)
                                            array_shift_entry(log.graph, i, i + direction)
                                            this.setState({ log: log })
                                        }}
                                        onChange={this.handle_subject_change.bind(this)}
                                        onCross={this.handle_subject_cross.bind(this)}
                                    />
                                    <div
                                        className='log-add-new-subject-button'
                                        onClick={() => add_subject(i + 1)}
                                    >
                                    </div>
                                </DraggableItem>
                            )
                        })
                    }

                </ShrinkContainer>
            </SubContainer>
        )
    }
    render() {
        const log = this.state.log
        return (
            <Container style={{ rowGap: '10px' }} key={this.state.key}>
                <SubContainer style={{ fontSize: 'large' }}>
                    <Section>
                        <InputText value={log.name} onChange={this.handle_log_change.bind(this)} />
                        <SubSection>
                            <RearrangeButton onRearrange={this.props.onRearrange} />
                        </SubSection>
                        <SubSection>
                            <Button onClick={() => {
                                this.props.onSave(this.props.index,  this.state.log)
                                this.setState({ key: this.state.key + 1 })
                            }}>Save 💼</Button>
                            <Button onClick={() => this.props.onCross(this.props.index)}>✖</Button>
                        </SubSection>
                    </Section>
                </SubContainer>
                <ShrinkContainer
                    hide_sign="Hide Details ↑"
                    show_sign="Show Details ↓"
                    switch_off={!log.show_details}
                    onSwitch={(switch_condition) => log.show_details = !switch_condition}
                    className="log-subject-and-graph-container">
                    {this.props.flex_row ?
                        <SplitContainer
                            leftComponent={this.render_subjects(log, true, { height: 500, overflow: 'auto' })}
                            rightComponent={<HistoGraph disable_button="true" graph={log.graph} />}
                            limit={{ left: 30, right: 10 }}
                        /> :
                        <div style={{ display: 'flex', rowGap: '10px', flexDirection: 'column', width: '100%' }}>
                            {this.render_subjects(log, false, { height: '100%' })}
                            <HistoGraph graph={log.graph} />
                        </div>
                    }
                </ShrinkContainer>
            </Container>
        )
    }
}
