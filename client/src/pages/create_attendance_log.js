import React from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Container, AttendanceLog, Button, SmoothAddContainer, DraggableItem, array_shift_entry } from "../building_components"

class Component extends React.Component {
    constructor(props) {
        super(props)

        let logs = localStorage.getItem('logs')
        if (logs === 'undefined' || logs === null) { logs = []; localStorage.setItem('logs', '[]') }
        else logs = JSON.parse(logs)

        const flex_flow_tolerance = 600

        this.state = {
            logs: logs,
            flex_row: window.innerWidth >= flex_flow_tolerance
        }

        window.addEventListener('resize', () => {
            if (window.innerWidth >= flex_flow_tolerance) {
                if (!this.state.flex_row) {
                    this.setState({ flex_row: true })
                }
            }
            else {
                if (this.state.flex_row) {
                    this.setState({ flex_row: false })
                }
            }
        })
    }
    render() {
        return (
            <DndProvider backend={HTML5Backend}>
                <div style={{ textAlign: 'center' }}>
                    <Container style={{ alignContent: 'center', fontSize: 'xx-large' }}>
                        <Button
                            style={{ boxSizing: 'border-box', width: '50%' }}
                            onClick={() => {
                                let logs = JSON.parse(localStorage.getItem('logs'))
                                let key_count = Number(localStorage.getItem('key_count'))
                                if (key_count === 'undefined' || key_count === null) {
                                    key_count = 0
                                    localStorage.setItem('key_count', 0)
                                }
                                logs.unshift({
                                    name: 'log name',
                                    subjects: [],
                                    graph: [],
                                    key_count: 0,
                                    show_details: true,
                                    key: key_count,
                                })
                                localStorage.setItem('key_count', key_count + 1)
                                localStorage.setItem('logs', JSON.stringify(logs))
                                this.setState({ logs: logs })
                            }}
                        >
                            +
                        </Button>
                    </Container>
                    {!this.state.logs.length ? <Container>Nothing to show! Add a log to get started.</Container> :
                        this.state.logs.map((value, i) => {
                            return (
                                <SmoothAddContainer key={value.key}>
                                    <AttendanceLog
                                        index={i}
                                        log={value}
                                        flex_row={this.state.flex_row}
                                        onSave={(index, log) => {
                                            let logs = JSON.parse(localStorage.getItem('logs'))
                                            logs[index] = log
                                            localStorage.setItem('logs', JSON.stringify(logs))
                                            this.setState({ log: logs })
                                        }}
                                        onCross={(index) => {
                                            let logs = JSON.parse(localStorage.getItem('logs'))
                                            logs.splice(index, 1)
                                            localStorage.setItem('logs', JSON.stringify(logs))
                                            this.setState({ logs: logs })
                                        }}
                                        onRearrange={(direction) => {
                                            let logs = JSON.parse(localStorage.getItem('logs'))
                                            array_shift_entry(logs, i, i + direction)
                                            localStorage.setItem('logs', JSON.stringify(logs))
                                            this.setState({ logs: logs })
                                        }}
                                    />
                                </SmoothAddContainer>
                            )
                        })}
                </div>
            </DndProvider>
        )
    }
}

export default Component
